/**
 * Convert Ruoyi-style Options API <script> blocks to <script setup>.
 * Usage: node scripts/ruoyi-to-setup.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const TARGETS = [
  'src/views/system',
  'src/views/tool',
  'src/views/components',
  'src/layout',
  'src/components',
  'src/App.vue',
]

function walk(entry, acc = []) {
  const p = path.isAbsolute(entry) ? entry : path.join(root, entry)
  if (!fs.existsSync(p)) return acc
  if (p.endsWith('.vue')) {
    acc.push(p)
    return acc
  }
  for (const name of fs.readdirSync(p)) {
    const fp = path.join(p, name)
    if (fs.statSync(fp).isDirectory()) walk(fp, acc)
    else if (name.endsWith('.vue')) acc.push(fp)
  }
  return acc
}

function splitVue(content) {
  const scriptMatch = content.match(/<script([^>]*)>([\s\S]*?)<\/script>/i)
  if (!scriptMatch) return null
  const before = content.slice(0, scriptMatch.index)
  const after = content.slice(scriptMatch.index + scriptMatch[0].length)
  return {
    before,
    after,
    scriptAttrs: scriptMatch[1],
    scriptBody: scriptMatch[2],
  }
}

function extractBalancedObject(src, startIdx) {
  let depth = 0
  let i = startIdx
  for (; i < src.length; i++) {
    const c = src[i]
    if (c === '{') depth++
    else if (c === '}') {
      depth--
      if (depth === 0) return src.slice(startIdx, i + 1)
    }
  }
  return null
}

function convertRuoyiScript(body) {
  if (body.includes('script setup') || !body.includes('export default')) return null
  if (/render\s*\(\s*\)/.test(body) && !body.includes('data()')) return null

  const nameM = body.match(/name\s*:\s*['"]([^'"]+)['"]/)
  const name = nameM?.[1]
  const dictsM = body.match(/dicts\s*:\s*\[([^\]]*)\]/)

  const dataM = body.match(/data\s*\(\s*\)\s*\{/)
  let dataObj = '{}'
  if (dataM) {
    const braceStart = body.indexOf('{', dataM.index + dataM[0].length)
    const obj = extractBalancedObject(body, braceStart)
    if (obj) {
      const retM = obj.match(/return\s*(\{[\s\S]*\})\s*;?\s*$/)
      if (retM) dataObj = retM[1]
    }
  }

  const methodsM = body.match(/methods\s*:\s*\{/)
  let methodsBlock = ''
  if (methodsM) {
    const start = body.indexOf('{', methodsM.index)
    methodsBlock = extractBalancedObject(body, start)?.slice(1, -1) || ''
  }

  const imports = new Set()
  const header = []

  if (name) header.push(`defineOptions({ name: '${name}' })`)
  if (dictsM) {
    imports.add("import { useDict } from '@/composables/useDict'")
    header.push(`const dict = useDict(${dictsM[1].trim()})`)
  }

  const needsVue = []
  if (dataM || methodsBlock) needsVue.push('ref', 'reactive')
  if (/created\s*\(\)/.test(body)) needsVue.push('onMounted')
  if (/\$nextTick/.test(body)) needsVue.push('nextTick')
  if (/\$route|\$router/.test(body)) {
    imports.add("import { useRoute, useRouter } from 'vue-router'")
    header.push('const route = useRoute()', 'const router = useRouter()')
  }
  if (/\$store|mapState|mapGetters|mapActions/.test(body)) {
    imports.add("import { useStore } from 'vuex'")
    header.push('const store = useStore()')
  }
  if (/\$modal/.test(body)) imports.add("import modal from '@/plugins/modal'")
  if (/\$message(?!Box)/.test(body)) imports.add("import { ElMessage } from 'element-plus'")
  if (/\$confirm/.test(body)) imports.add("import { ElMessageBox } from 'element-plus'")
  if (/\bparseTime\b/.test(body + methodsBlock)) imports.add("import { parseTime } from '@/utils/fuint'")
  if (/\baddDateRange\b/.test(methodsBlock)) imports.add("import { addDateRange } from '@/utils/fuint'")
  if (/\bresetForm\b/.test(methodsBlock)) imports.add("import { resetForm } from '@/utils/fuint'")
  if (/\bdownload\s*\(/.test(methodsBlock)) imports.add("import { download } from '@/utils/request'")
  if (/\bgetName\b/.test(methodsBlock)) imports.add("import { getName } from '@/utils/fuint'")
  if (/\bhandleTree\b/.test(methodsBlock)) imports.add("import { handleTree } from '@/utils/fuint'")

  const apiImports = body.match(/^import .+ from .+$/gm) || []
  apiImports.forEach((l) => imports.add(l.trim()))

  if (needsVue.length) {
    imports.add(`import { ${[...new Set(needsVue)].join(', ')} } from 'vue'`)
  }

  // data -> refs
  const decls = []
  const dataInner = dataObj.replace(/^\{|\}$/g, '').trim()
  const props = splitTopLevelProps(dataInner)
  for (const { key, val } of props) {
    const v = val.trim()
    if (/^\{/.test(v) || /^\[/.test(v)) {
      decls.push(`const ${key} = reactive(${v})`)
    } else {
      decls.push(`const ${key} = ref(${v})`)
    }
  }

  decls.push("const queryForm = ref(null)", "const formRef = ref(null)")

  let methods = methodsBlock
    .replace(/\bthis\.\$modal\./g, 'modal.')
    .replace(/\bthis\.\$message\b/g, 'ElMessage')
    .replace(/\bthis\.\$confirm\b/g, 'ElMessageBox.confirm')
    .replace(/\bthis\.\$store\b/g, 'store')
    .replace(/\bthis\.\$route\b/g, 'route')
    .replace(/\bthis\.\$router\b/g, 'router')
    .replace(/\bthis\.\$refs\["form"\]/g, 'formRef.value')
    .replace(/\bthis\.\$refs\['form'\]/g, 'formRef.value')
    .replace(/\bthis\.\$refs\.form\b/g, 'formRef.value')
    .replace(/\bthis\.\$refs\["queryForm"\]/g, 'queryForm.value')
    .replace(/\bthis\.\$refs\['queryForm'\]/g, 'queryForm.value')
    .replace(/\bthis\.\$refs\.queryForm\b/g, 'queryForm.value')
    .replace(/\bthis\.addDateRange\b/g, 'addDateRange')
    .replace(/\bthis\.resetForm\b/g, 'resetForm')
    .replace(/\bthis\.download\b/g, 'download')
    .replace(/\bthis\.parseTime\b/g, 'parseTime')
    .replace(/\bthis\.getName\b/g, 'getName')
    .replace(/\bthis\.handleTree\b/g, 'handleTree')

  // this.xxx -> xxx.value for known refs (heuristic)
  const refNames = props.filter((p) => !/^\{/.test(p.val.trim()) && !/^\[/.test(p.val.trim())).map((p) => p.key)
  const reactiveNames = props.filter((p) => /^\{/.test(p.val.trim()) || /^\[/.test(p.val.trim())).map((p) => p.key)

  for (const k of refNames) {
    const re = new RegExp(`\\bthis\\.${k}\\b`, 'g')
    methods = methods.replace(re, `${k}.value`)
  }
  for (const k of reactiveNames) {
    const re = new RegExp(`\\bthis\\.${k}\\b`, 'g')
    methods = methods.replace(re, k)
  }

  methods = methods
    .replace(/(\w+)\s*\([^)]*\)\s*\{/g, 'function $1(')
    .replace(/function function /g, 'function ')
    .replace(/,\s*function/g, '\nfunction')
    .replace(/submitForm:\s*function/g, 'function submitForm')

  // created hook
  const createdM = body.match(/created\s*\(\s*\)\s*\{([\s\S]*?)\n\s*\}/)
  let createdCalls = ''
  if (createdM) {
    createdCalls = createdM[1]
      .replace(/\bthis\./g, '')
      .trim()
      .replace(/;\s*$/, '')
  }

  const setup = `<script setup>
${[...imports].join('\n')}

${header.join('\n')}

${decls.join('\n')}

${methods.trim()}

${createdCalls ? `${createdCalls};` : ''}
</script>`

  return setup
}

function splitTopLevelProps(inner) {
  const res = []
  let depth = 0
  let key = ''
  let buf = ''
  for (let i = 0; i < inner.length; i++) {
    const c = inner[i]
    if (depth === 0 && c === ':') {
      key = buf.trim().replace(/,$/, '')
      buf = ''
      continue
    }
    if (c === '{' || c === '[') depth++
    if (c === '}' || c === ']') depth--
    if (depth === 0 && c === ',' && key) {
      res.push({ key, val: buf.trim() })
      key = ''
      buf = ''
      continue
    }
    buf += c
  }
  if (key && buf.trim()) res.push({ key, val: buf.trim() })
  return res
}

function convertFile(file) {
  const content = fs.readFileSync(file, 'utf8')
  if (content.includes('<script setup>')) return false
  const parts = splitVue(content)
  if (!parts) return false
  const setup = convertRuoyiScript(parts.scriptBody)
  if (!setup) return false
  fs.writeFileSync(file, parts.before + setup + parts.after, 'utf8')
  return true
}

const files = []
for (const t of TARGETS) walk(t, files)

let ok = 0
let skip = 0
for (const f of files) {
  try {
    if (convertFile(f)) {
      ok++
      console.log('converted', path.relative(root, f))
    } else skip++
  } catch (e) {
    console.error('fail', path.relative(root, f), e.message)
  }
}
console.log(`done: ${ok} converted, ${skip} skipped`)
