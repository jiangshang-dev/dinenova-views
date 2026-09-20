import fs from 'fs'
import path from 'path'

const root = path.resolve(import.meta.dirname, '..')

const FILES = []
function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name)
    if (ent.isDirectory()) walk(p)
    else if (ent.name.endsWith('.vue')) FILES.push(p)
  }
}

const dirs = [
  'src/views/member',
  'src/views/merchant',
  'src/views/cashier',
  'src/views/dashboard',
  'src/views/error',
].map(d => path.join(root, d))
for (const f of ['src/views/login.vue', 'src/views/index.vue', 'src/views/redirect.vue']) {
  FILES.push(path.join(root, f))
}
dirs.forEach(walk)

function findMatchingBrace(s, start) {
  let depth = 0
  for (let i = start; i < s.length; i++) {
    if (s[i] === '{') depth++
    else if (s[i] === '}') {
      depth--
      if (depth === 0) return i
    }
  }
  return -1
}

function extractSection(exportBody, key) {
  const re = new RegExp(`\\b${key}\\s*:\\s*`)
  const m = exportBody.match(re)
  if (!m) return null
  const idx = exportBody.indexOf(m[0]) + m[0].length
  if (exportBody[idx] === '{') {
    const end = findMatchingBrace(exportBody, idx)
    return exportBody.slice(idx + 1, end)
  }
  // function form: key() { or key: function() {
  const fnStart = exportBody.indexOf('{', idx)
  if (fnStart === -1) return null
  const end = findMatchingBrace(exportBody, fnStart)
  return exportBody.slice(fnStart + 1, end)
}

function convertFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8')
  if (content.includes('<script setup>')) return { file: filePath, ok: true, note: 'already setup' }

  const sm = content.match(/<script(\s[^>]*)?>([\s\S]*?)<\/script>/)
  if (!sm) return { file: filePath, ok: false, note: 'no script' }
  const scriptBody = sm[2]
  if (!scriptBody.includes('export default')) return { file: filePath, ok: false, note: 'no export default' }

  const em = scriptBody.match(/export default\s*\{([\s\S]*)\}\s*;?\s*$/)
  if (!em) return { file: filePath, ok: false, note: 'export parse fail' }
  const exportBody = em[1]

  const nameM = exportBody.match(/name\s*:\s*['"]([^'"]+)['"]/)
  const name = nameM ? nameM[1] : path.basename(filePath, '.vue')

  const importLines = scriptBody.split('\n').filter(l => /^\s*import\s/.test(l))

  const dataInner = extractSection(exportBody, 'data')
  let dataObj = ''
  if (dataInner) {
    const dm = dataInner.match(/return\s*\{([\s\S]*)\}\s*;?\s*$/)
    dataObj = dm ? dm[1].trim() : dataInner.trim()
  }

  const methodsInner = extractSection(exportBody, 'methods')
  const createdInner = extractSection(exportBody, 'created')
  const mountedInner = extractSection(exportBody, 'mounted')
  const activatedInner = extractSection(exportBody, 'activated')
  const beforeUnmountInner = extractSection(exportBody, 'beforeUnmount') || extractSection(exportBody, 'beforeDestroy')
  const watchInner = extractSection(exportBody, 'watch')
  const computedInner = extractSection(exportBody, 'computed')
  const propsInner = extractSection(exportBody, 'props')

  const needs = {
    vue: ['ref', 'reactive', 'computed', 'watch', 'onMounted', 'onBeforeUnmount', 'onActivated', 'nextTick'],
    router: /\$router|\$route/.test(scriptBody),
    store: /\$store/.test(scriptBody),
    modal: /\$modal|\$alert|\$prompt/.test(scriptBody),
    resetForm: /resetForm/.test(scriptBody),
    addDateRange: /addDateRange/.test(scriptBody),
    messageBox: /\$prompt/.test(scriptBody),
  }

  const vueImports = needs.vue.filter(Boolean)
  let setup = importLines.filter(l => !l.includes("from 'vue'") && !l.includes('from "vue"')).join('\n')
  setup += `\nimport { ${vueImports.join(', ')} } from 'vue'\n`
  if (needs.router) setup += "import { useRouter, useRoute } from 'vue-router'\n"
  if (needs.store) setup += "import { useStore } from 'vuex'\n"
  if (needs.modal) setup += "import modal from '@/plugins/modal'\n"
  if (needs.resetForm) setup += "import { resetForm } from '@/utils/fuint'\n"
  if (needs.addDateRange) setup += "import { addDateRange } from '@/utils/fuint'\n"
  if (needs.messageBox) setup += "import { ElMessageBox } from 'element-plus'\n"

  setup += `\ndefineOptions({ name: '${name}' })\n\n`
  if (needs.router) setup += 'const router = useRouter()\nconst route = useRoute()\n'
  if (needs.store) setup += 'const store = useStore()\n'

  if (propsInner) {
    setup += `const props = defineProps({\n${propsInner.trim()}\n})\n`
  }

  if (/emit\(/.test(methodsInner || '') || /\$emit/.test(scriptBody)) {
    setup += "const emit = defineEmits([])\n"
  }

  if (dataObj) {
    setup += `\nconst state = reactive({\n${dataObj}\n})\n`
    // expose state fields to template (Vue script setup auto-unwraps refs, reactive props need toRef or destructure)
    // Use toRefs for template compatibility
    setup += `\nconst {\n${dataObj.split('\n').map(l => {
      const m = l.match(/^\s*(\w+)\s*:/)
      return m ? `  ${m[1]}` : null
    }).filter(Boolean).join(',\n')}\n} = toRefs(state)\n`
    setup += "\nimport { toRefs } from 'vue'\n"
  }

  function transformMethodBody(body) {
    return body
      .replace(/\bthis\.\$refs\[['"](\w+)['"]\]/g, '$1Ref.value')
      .replace(/\bthis\.\$refs\.(\w+)/g, '$1Ref.value')
      .replace(/\bthis\.\$modal/g, 'modal')
      .replace(/\bthis\.\$router/g, 'router')
      .replace(/\bthis\.\$route/g, 'route')
      .replace(/\bthis\.\$store/g, 'store')
      .replace(/\bthis\.\$emit/g, 'emit')
      .replace(/\bthis\.\$nextTick/g, 'nextTick')
      .replace(/\bthis\.\$alert/g, 'modal.alert')
      .replace(/\bthis\.\$prompt/g, 'ElMessageBox.prompt')
      .replace(/\bconst app = this\b/g, 'const app = state')
      .replace(/\bthis\./g, 'state.')
  }

  if (methodsInner) {
    setup += '\n'
    const methodRe = /(\w+)\s*(:\s*)?(?:function\s*)?\([^)]*\)\s*\{/g
    let pos = 0
    let m
    while ((m = methodRe.exec(methodsInner))) {
      const fnName = m[1]
      const braceStart = methodsInner.indexOf('{', m.index)
      const braceEnd = findMatchingBrace(methodsInner, braceStart)
      if (braceEnd === -1) continue
      let fnBody = methodsInner.slice(braceStart + 1, braceEnd)
      fnBody = transformMethodBody(fnBody)
      const fnSig = methodsInner.slice(m.index, braceStart + 1).replace(/:\s*function\s*/, 'function ')
      setup += `function ${fnName}${fnSig.slice(fnName.length)}\n${fnBody}}\n\n`
    }
  }

  if (watchInner) {
    setup += `\nwatch(${transformMethodBody(watchInner)})\n`
  }

  if (computedInner) {
    setup += `\n// computed - manual review needed\n`
  }

  if (createdInner) setup += `\n${transformMethodBody(createdInner.trim())}\n`
  if (mountedInner) setup += `\nonMounted(() => {\n${transformMethodBody(mountedInner.trim())}\n})\n`
  if (activatedInner) setup += `\nonActivated(() => {\n${transformMethodBody(activatedInner.trim())}\n})\n`
  if (beforeUnmountInner) setup += `\nonBeforeUnmount(() => {\n${transformMethodBody(beforeUnmountInner.trim())}\n})\n`

  // Fix toRefs import order - move import to top
  setup = setup.replace(/\nimport \{ toRefs \} from 'vue'\n/, '')
  setup = setup.replace(
    /import \{ ([^}]+) \} from 'vue'/,
    (match, imports) => {
      const set = new Set(imports.split(',').map(s => s.trim()))
      set.add('toRefs')
      return `import { ${[...set].join(', ')} } from 'vue'`
    }
  )

  const newScript = `<script setup>\n${setup.trim()}\n</script>`
  const newContent = content.replace(/<script(\s[^>]*)?>[\s\S]*?<\/script>/, newScript)
  fs.writeFileSync(filePath, newContent)
  return { file: filePath, ok: true, note: 'converted' }
}

const results = []
for (const f of [...new Set(FILES)].sort()) {
  try {
    results.push(convertFile(f))
  } catch (e) {
    results.push({ file: f, ok: false, note: e.message })
  }
}
const failed = results.filter(r => !r.ok)
const ok = results.filter(r => r.ok)
console.log(`OK: ${ok.length}, Failed: ${failed.length}`)
failed.forEach(r => console.log('FAIL', r.file, r.note))
ok.filter(r => r.note === 'converted').forEach(r => console.log('DONE', path.relative(root, r.file)))
