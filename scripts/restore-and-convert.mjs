import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

const root = path.resolve(import.meta.dirname, '..')

const REL_PATHS = []
function walk(rel) {
  const full = path.join(root, rel)
  if (!fs.existsSync(full)) return
  if (rel.endsWith('.vue')) {
    REL_PATHS.push(rel)
    return
  }
  for (const name of fs.readdirSync(full)) {
    walk(path.join(rel, name))
  }
}

;[
  'src/views/member',
  'src/views/merchant',
  'src/views/cashier',
  'src/views/dashboard/LineChart.vue',
  'src/views/dashboard/BarChart.vue',
  'src/views/dashboard/PieChart.vue',
  'src/views/dashboard/RaddarChart.vue',
  'src/views/login.vue',
  'src/views/index.vue',
].forEach(walk)

function topLevelKeys(dataFields) {
  const keys = []
  let depth = 0
  for (const line of dataFields.split('\n')) {
    if (depth === 0) {
      const m = line.match(/^\s*(\w+)\s*:/)
      if (m) keys.push(m[1])
    }
    depth += (line.match(/\{/g) || []).length
    depth -= (line.match(/\}/g) || []).length
  }
  return keys
}

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

function extractObjectAfterKey(exportBody, key) {
  const re = new RegExp(`\\b${key}\\s*:\\s*`)
  const m = exportBody.match(re)
  if (!m) return null
  const idx = exportBody.indexOf(m[0]) + m[0].length
  const fnStart = exportBody.indexOf('{', idx)
  const end = findMatchingBrace(exportBody, fnStart)
  const body = exportBody.slice(fnStart + 1, end)
  const isFn = /^\s*function\s*\(/.test(exportBody.slice(idx)) || exportBody.slice(idx, idx + 20).includes('function')
  return { body, isFn: key === 'data' || key === 'created' || key === 'mounted' || isFn }
}

function parseMethods(methodsBody) {
  const methods = []
  const skip = new Set(['then', 'catch', 'function', 'if', 'forEach', 'for', 'while', 'switch'])
  const re = /(?:^|\n)(\s*)(\w+)\s*(:\s*)?(?:function\s*)?\([^)]*\)\s*\{/g
  let m
  while ((m = re.exec(methodsBody))) {
    const fnName = m[2]
    if (skip.has(fnName)) continue
    if (m[1].length > 10) continue
    const fnIdx = m.index + m[0].indexOf(fnName)
    const parenStart = methodsBody.indexOf('(', fnIdx)
    let p = parenStart + 1
    let depth = 1
    while (p < methodsBody.length && depth > 0) {
      if (methodsBody[p] === '(') depth++
      else if (methodsBody[p] === ')') depth--
      p++
    }
    const params = methodsBody.slice(parenStart + 1, p - 1).trim()
    const braceStart = methodsBody.indexOf('{', p)
    const braceEnd = findMatchingBrace(methodsBody, braceStart)
    methods.push({ name: fnName, params, body: methodsBody.slice(braceStart + 1, braceEnd) })
  }
  return methods
}

function buildTransform(fieldNames, methodNames, propNames = []) {
  const methodSet = new Set(methodNames)
  return function transform(code) {
    let s = code
    s = s.replace(/\bthis\.\$refs\[['"](\w+)['"]\]/g, '$1Ref.value')
    s = s.replace(/\bthis\.\$refs\.(\w+)/g, '$1Ref.value')
    s = s.replace(/\bthis\.\$modal/g, 'modal')
    s = s.replace(/\bthis\.\$router/g, 'router')
    s = s.replace(/\bthis\.\$route/g, 'route')
    s = s.replace(/\bthis\.\$store/g, 'store')
    s = s.replace(/\bthis\.\$emit/g, 'emit')
    s = s.replace(/\bthis\.\$nextTick/g, 'nextTick')
    s = s.replace(/\bthis\.\$alert/g, 'modal.alert')
    s = s.replace(/\bthis\.\$prompt/g, 'ElMessageBox.prompt')
    s = s.replace(/\bconst app = this\b/g, '')
    s = s.replace(/\bconst app = state\b/g, '')
    s = s.replace(/\bapp\.\$modal/g, 'modal')
    s = s.replace(/\bapp\.\$emit/g, 'emit')
    s = s.replace(/\bapp\.\$router/g, 'router')
    s = s.replace(/\bapp\.\$store/g, 'store')
    s = s.replace(/\bapp\.\$alert/g, 'modal.alert')
    for (const mn of methodSet) {
      s = s.replace(new RegExp(`\\bthis\\.${mn}\\s*\\(`, 'g'), `${mn}(`)
      s = s.replace(new RegExp(`\\bapp\\.${mn}\\s*\\(`, 'g'), `${mn}(`)
      s = s.replace(new RegExp(`\\bstate\\.${mn}\\s*\\(`, 'g'), `${mn}(`)
    }
    for (const pn of propNames) {
      s = s.replace(new RegExp(`\\bthis\\.${pn}\\b`, 'g'), `props.${pn}`)
      s = s.replace(new RegExp(`\\bapp\\.${pn}\\b`, 'g'), `props.${pn}`)
    }
    for (const fn of fieldNames) {
      if (propNames.includes(fn)) continue
      s = s.replace(new RegExp(`\\bthis\\.${fn}\\.`, 'g'), `${fn}.value.`)
      s = s.replace(new RegExp(`\\bthis\\.${fn}\\b`, 'g'), `${fn}.value`)
      s = s.replace(new RegExp(`\\bapp\\.${fn}\\.`, 'g'), `${fn}.value.`)
      s = s.replace(new RegExp(`\\bapp\\.${fn}\\b`, 'g'), `${fn}.value`)
      s = s.replace(new RegExp(`\\bstate\\.${fn}\\.`, 'g'), `${fn}.value.`)
      s = s.replace(new RegExp(`\\bstate\\.${fn}\\b`, 'g'), `${fn}.value`)
    }
    s = s.replace(/\bthis\.(\w+Ref)\./g, '$1.value.')
    s = s.replace(/\bthis\.(\w+Ref)\b/g, '$1')
    s = s.replace(/\bresetForm\s*\(\s*["'](\w+)["']\s*\)/g, (_, r) => `${r}Ref.value?.resetFields()`)
    return s
  }
}

function convertVue(content, fallbackName) {
  const sm = content.match(/<script(\s[^>]*)?>([\s\S]*?)<\/script>/)
  if (!sm || !sm[2].includes('export default')) return content

  const scriptBody = sm[2]
  const em = scriptBody.match(/export default\s*\{([\s\S]*)\}\s*;?\s*$/)
  if (!em) return content
  const exportBody = em[1]

  const nameM = exportBody.match(/^\s*name\s*:\s*['"]([^'"]+)['"]/m)
  const compName = nameM ? nameM[1] : fallbackName

  const importLines = scriptBody.split('\n').filter(l => /^\s*import\s/.test(l))

  let dataFields = ''
  const dataStart = exportBody.match(/\bdata\s*\(\s*\)\s*\{[\s\S]*?return\s*\{/)
  if (dataStart) {
    const braceStart = exportBody.indexOf('{', dataStart.index + dataStart[0].length - 1)
    const braceEnd = findMatchingBrace(exportBody, braceStart)
    dataFields = exportBody.slice(braceStart + 1, braceEnd).trim()
  }
  const fieldNames = [...dataFields.matchAll(/^\s*(\w+)\s*:/gm)].map(m => m[1])

  const methodsSec = extractObjectAfterKey(exportBody, 'methods')
  const methods = methodsSec ? parseMethods(methodsSec.body) : []
  const methodNames = methods.map(m => m.name)

  const propsSec = extractObjectAfterKey(exportBody, 'props')
  const propsArrayM2 = exportBody.match(/props\s*:\s*\[([\s\S]*?)\]/)
  const propNames = propsArrayM2
    ? propsArrayM2[1].split(',').map(s => s.trim().replace(/['"]/g, '')).filter(Boolean)
    : propsSec ? [...propsSec.body.matchAll(/^\s*(\w+)\s*:/gm)].map(m => m[1]) : []
  const transform = buildTransform(fieldNames, methodNames, propNames)
  const watchSec = extractObjectAfterKey(exportBody, 'watch')
  const computedSec = extractObjectAfterKey(exportBody, 'computed')
  const createdSec = extractObjectAfterKey(exportBody, 'created')
  const mountedSec = extractObjectAfterKey(exportBody, 'mounted')
  const activatedSec = extractObjectAfterKey(exportBody, 'activated')
  const beforeUnmountSec = extractObjectAfterKey(exportBody, 'beforeUnmount') || extractObjectAfterKey(exportBody, 'beforeDestroy')

  const needsRouter = /\$router|\$route/.test(scriptBody)
  const needsStore = /\$store/.test(scriptBody)
  const needsModal = /\$modal|\$alert/.test(scriptBody)
  const needsPrompt = /\$prompt/.test(scriptBody)
  const needsAddDateRange = /addDateRange/.test(scriptBody)
  const hasEmit = /\$emit/.test(scriptBody)
  const hasMixins = /mixins\s*:/.test(exportBody)

  if (hasMixins) {
    return convertChartWithMixin(content, compName, importLines, exportBody, dataFields, propsSec, methodsSec, mountedSec, beforeUnmountSec, watchSec, fallbackName)
  }

  const vueImports = ['ref', 'reactive', 'computed', 'watch', 'onMounted', 'onBeforeUnmount', 'onActivated', 'nextTick', 'toRefs']
  let out = importLines.filter(l => !l.includes("from 'vue'")).join('\n') + '\n'
  out += `import { ${vueImports.join(', ')} } from 'vue'\n`
  if (needsRouter) out += "import { useRouter, useRoute } from 'vue-router'\n"
  if (needsStore) out += "import { useStore } from 'vuex'\n"
  if (needsModal || needsPrompt) out += "import modal from '@/plugins/modal'\n"
  if (needsAddDateRange) out += "import { addDateRange } from '@/utils/fuint'\n"
  if (needsPrompt) out += "import { ElMessageBox } from 'element-plus'\n"

  out += `\ndefineOptions({ name: '${compName}' })\n\n`
  if (needsRouter) out += 'const router = useRouter()\nconst route = useRoute()\n'
  if (needsStore) out += 'const store = useStore()\n'

  const propsArrayM = exportBody.match(/props\s*:\s*\[([\s\S]*?)\]/)
  if (propsArrayM) {
    const items = propsArrayM[1].split(',').map(s => s.trim().replace(/['"]/g, '')).filter(Boolean)
    out += `const props = defineProps([${items.map(i => `'${i}'`).join(', ')}])\n\n`
  } else if (propsSec) {
    out += `const props = defineProps({\n${propsSec.body.trim()}\n})\n\n`
  }
  if (hasEmit) out += 'const emit = defineEmits([])\n\n'

  if (dataFields) {
    out += `const state = reactive({\n${dataFields}\n})\n`
    const topKeys = topLevelKeys(dataFields)
    out += `const { ${topKeys.join(', ')} } = toRefs(state)\n\n`
  }

  for (const method of methods) {
    out += `function ${method.name}(${method.params}) {\n${transform(method.body)}\n}\n\n`
  }

  if (computedSec) {
    for (const cm of computedSec.body.matchAll(/(\w+)\s*\(\)\s*\{([\s\S]*?)\n\s*\}/g)) {
      out += `const ${cm[1]} = computed(() => {${transform(cm[2])}})\n\n`
    }
  }

  if (watchSec) {
    out += convertWatch(watchSec.body, propsSec, transform)
  }

  if (createdSec) out += transform(createdSec.body.trim()) + '\n\n'
  if (mountedSec) out += `onMounted(() => {\n${transform(mountedSec.body.trim())}\n})\n\n`
  if (activatedSec) out += `onActivated(() => {\n${transform(activatedSec.body.trim())}\n})\n\n`
  if (beforeUnmountSec) out += `onBeforeUnmount(() => {\n${transform(beforeUnmountSec.body.trim())}\n})\n\n`

  return content.replace(/<script(\s[^>]*)?>[\s\S]*?<\/script>/, `<script setup>\n${out.trim()}\n</script>`)
}

function parseDataToRefs(dataFields) {
  // naive: split top-level keys - works for most admin pages
  let out = ''
  const lines = dataFields.split('\n')
  let buf = ''
  let key = ''
  let depth = 0
  for (const line of lines) {
    if (!key && /^\s*(\w+)\s*:/.test(line) && depth === 0) {
      key = line.match(/^\s*(\w+)\s*:/)[1]
      buf = line
      depth += (line.match(/\{/g) || []).length
      depth -= (line.match(/\}/g) || []).length
      if (depth === 0 && !line.includes('{')) {
        out += `const ${key} = ref(${extractValue(line)})\n`
        key = ''
        buf = ''
      }
      continue
    }
    if (key) {
      buf += '\n' + line
      depth += (line.match(/\{/g) || []).length
      depth -= (line.match(/\}/g) || []).length
      if (depth <= 0) {
        const val = buf.replace(/^\s*\w+\s*:\s*/, '').replace(/,\s*$/, '')
        out += `const ${key} = ref(${val.trim()})\n`
        key = ''
        buf = ''
        depth = 0
      }
    }
  }
  return out + '\n'
}

function extractValue(line) {
  const v = line.replace(/^\s*\w+\s*:\s*/, '').replace(/,\s*$/, '')
  return v.trim() || 'null'
}

function convertWatch(watchBody, propsSec, transform) {
  let out = ''
  const routeM = watchBody.match(/\$route\s*:\s*\{([\s\S]*)\}/)
  if (routeM) {
    const handlerM = routeM[1].match(/handler\s*:\s*function\s*\([^)]*\)\s*\{([\s\S]*?)\}\s*,?/)
    const immediate = /immediate\s*:\s*true/.test(routeM[1])
    if (handlerM) {
      out += `watch(() => route.fullPath, () => {${transform(handlerM[1])}}, { immediate: ${immediate} })\n\n`
    }
    return out
  }
  const watchRe = /(\w+)\s*\(\s*(\w+)\s*\)\s*\{/g
  let wm
  while ((wm = watchRe.exec(watchBody))) {
    if (wm[1] === '$route') continue
    const bs = watchBody.indexOf('{', wm.index)
    const be = findMatchingBrace(watchBody, bs)
    const body = watchBody.slice(bs + 1, be)
    const src = propsSec ? `() => props.${wm[1]}` : wm[1]
    out += `watch(${src}, (${wm[2]}) => {${transform(body)}})\n\n`
  }
  return out
}

function convertChartWithMixin(content, compName, importLines, exportBody, dataFields, propsSec, methodsSec, mountedSec, beforeUnmountSec, watchSec, fallbackName) {
  compName = fallbackName || compName
  // Keep chart logic; replace mixin with composable
  const methods = methodsSec ? parseMethods(methodsSec.body) : []
  let out = importLines.filter(l => !l.includes('mixins/resize')).join('\n') + '\n'
  out += "import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'\n"
  out += "import { useChartResize } from './composables/useChartResize'\n\n"
  out += `defineOptions({ name: '${compName}' })\n\n`
  if (propsSec) {
    out += `const props = defineProps({\n${propsSec.body.trim()}\n})\n\n`
  }
  out += 'const chartEl = ref(null)\nlet chart = null\nuseChartResize(() => chart)\n\n'
  for (const method of methods) {
    let body = method.body
      .replace(/\bthis\.\$el\b/g, 'chartEl.value')
      .replace(/\bthis\.chart\b/g, 'chart')
      .replace(/\bthis\.chartData\b/g, 'props.chartData')
      .replace(/\bthis\.setOptions\b/g, 'setOptions')
    out += `function ${method.name}(${method.params}) {\n${body}\n}\n\n`
  }
  if (watchSec) {
    out += `watch(() => props.chartData, (val) => { setOptions(val) }, { deep: true })\n\n`
  }
  if (mountedSec) {
    out += `onMounted(() => {\nnextTick(() => { initChart() })\n})\n\n`
  }
  if (beforeUnmountSec) {
    out += `onBeforeUnmount(() => {\nif (!chart) return\nchart.dispose()\nchart = null\n})\n\n`
  }
  let tpl = content.replace(/<div :class="className"/, '<div ref="chartEl" :class="className"')
  tpl = tpl.replace(/<script(\s[^>]*)?>[\s\S]*?<\/script>/, `<script setup>\n${out.trim()}\n</script>`)
  return tpl
}

const skip = new Set(['src/views/error/404.vue', 'src/views/error/401.vue', 'src/views/redirect.vue', 'src/views/dashboard/PanelGroup.vue'])
const results = []
for (const rel of REL_PATHS) {
  if (skip.has(rel)) continue
  let original
  try {
    original = execSync(`git show HEAD:${rel}`, { cwd: root, encoding: 'utf8' })
  } catch (e) {
    results.push({ rel, ok: false, note: e.message })
    continue
  }
  try {
    fs.writeFileSync(path.join(root, rel), convertVue(original, path.basename(rel, '.vue')))
    results.push({ rel, ok: true })
  } catch (e) {
    results.push({ rel, ok: false, note: e.message })
  }
}
console.log('OK', results.filter(r => r.ok).length, 'FAIL', results.filter(r => !r.ok).length)
results.filter(r => !r.ok).forEach(r => console.log(r.rel, r.note))
