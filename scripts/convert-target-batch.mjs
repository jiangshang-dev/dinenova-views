/**
 * Batch convert remaining Options API .vue files in system/tool/components paths.
 * Usage: node scripts/convert-target-batch.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const SKIP = new Set([
  'src/views/system/config/index.vue',
  'src/views/system/logs/index.vue',
  'src/views/tool/swagger/index.vue',
  'src/views/components/icons/index.vue',
  'src/components/Hamburger/index.vue',
  'src/components/SvgIcon/index.vue',
  'src/components/ParentView/index.vue',
  'src/components/Pagination/index.vue',
  'src/components/PanThumb/index.vue',
  'src/components/DictTag/index.vue',
  'src/components/Breadcrumb/index.vue',
  'src/components/Screenfull/index.vue',
  'src/components/SizeSelect/index.vue',
  'src/components/RightToolbar/index.vue',
  'src/components/iFrame/index.vue',
  'src/components/Editor/index.vue',
  'src/components/Fuint/Git/index.vue',
  'src/components/Fuint/Doc/index.vue',
])

const WALK_ROOTS = [
  'src/views/system',
  'src/views/tool',
  'src/views/components',
  'src/components',
]

function walk(rel, acc = []) {
  const full = path.join(root, rel)
  if (!fs.existsSync(full)) return acc
  const st = fs.statSync(full)
  if (st.isFile() && rel.endsWith('.vue')) {
    acc.push(rel)
    return acc
  }
  if (!st.isDirectory()) return acc
  for (const name of fs.readdirSync(full)) {
    walk(path.join(rel, name), acc)
  }
  return acc
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
  return { body }
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

function buildTransform(fieldNames, methodNames, propNames = []) {
  const methodSet = new Set(methodNames)
  return function transform(code) {
    let s = code
    s = s.replace(/\bthis\.\$refs\[['"](\w+)['"]\]/g, '$1Ref.value')
    s = s.replace(/\bthis\.\$refs\[(\w+)\]/g, '($1Ref.value)')
    s = s.replace(/\bthis\.\$refs\.(\w+)/g, '$1Ref.value')
    s = s.replace(/\bthis\.\$modal/g, 'modal')
    s = s.replace(/\bthis\.\$router/g, 'router')
    s = s.replace(/\bthis\.\$route/g, 'route')
    s = s.replace(/\bthis\.\$store/g, 'store')
    s = s.replace(/\bthis\.\$emit/g, 'emit')
    s = s.replace(/\bthis\.\$nextTick/g, 'nextTick')
    s = s.replace(/\bthis\.\$alert/g, 'modal.alert')
    s = s.replace(/\bthis\.\$prompt/g, 'ElMessageBox.prompt')
    s = s.replace(/\bthis\.addDateRange/g, 'addDateRange')
    s = s.replace(/\bthis\.download/g, 'download')
    s = s.replace(/\bthis\.parseTime/g, 'parseTime')
    s = s.replace(/\bconst app = this\b/g, '')
    s = s.replace(/\bconst app = state\b/g, '')
    s = s.replace(/\bapp\.\$modal/g, 'modal')
    s = s.replace(/\bapp\.\$emit/g, 'emit')
    s = s.replace(/\bapp\.\$router/g, 'router')
    s = s.replace(/\bapp\.\$store/g, 'store')
    s = s.replace(/\bapp\.\$alert/g, 'modal.alert')
    s = s.replace(/\bapp\.(\w+)/g, (_, k) => {
      if (fieldNames.includes(k)) return `${k}.value`
      return `props.${k}`
    })
    for (const mn of methodSet) {
      s = s.replace(new RegExp(`\\bthis\\.${mn}\\s*\\(`, 'g'), `${mn}(`)
      s = s.replace(new RegExp(`\\bapp\\.${mn}\\s*\\(`, 'g'), `${mn}(`)
    }
    for (const pn of propNames) {
      s = s.replace(new RegExp(`\\bthis\\.${pn}\\b`, 'g'), `props.${pn}`)
    }
    for (const fn of fieldNames) {
      if (propNames.includes(fn)) continue
      s = s.replace(new RegExp(`\\bthis\\.${fn}\\.`, 'g'), `${fn}.value.`)
      s = s.replace(new RegExp(`\\bthis\\.${fn}\\b`, 'g'), `${fn}.value`)
    }
    s = s.replace(/\bresetForm\s*\(\s*["'](\w+)["']\s*\)/g, (_, r) => `${r}Ref.value?.resetFields()`)
    return s
  }
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
  // string handler: 'methodName'
  for (const m of watchBody.matchAll(/['"]?(\w+)['"]?\s*:\s*['"](\w+)['"]/g)) {
    out += `watch(${m[1]}, ${m[2]})\n\n`
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

function convertChartsIndex(content) {
  const composablePath = path.join(root, 'src/views/components/charts/composables/useChartResize.js')
  if (!fs.existsSync(path.dirname(composablePath))) {
    fs.mkdirSync(path.dirname(composablePath), { recursive: true })
  }
  if (!fs.existsSync(composablePath)) {
    fs.copyFileSync(
      path.join(root, 'src/views/dashboard/composables/useChartResize.js'),
      composablePath
    )
  }

  const serieBlock = content.match(/const serieDataItem = \{[\s\S]*?\n\}/)
  const serie = serieBlock ? serieBlock[0] : ''

  const script = `<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import { useChartResize } from './composables/useChartResize'

${serie}

defineOptions({ name: 'Charts' })

const props = defineProps({
  id: { type: String, default: 'chart' },
  title: { type: String, default: '' },
  color: { type: String, default: '#113a28' },
  chartType: { type: String, default: 'bar' },
  headList: { type: Array, default: () => [] },
  dataList: { type: Array, default: () => [] },
  width: { type: String, default: '200px' },
  height: { type: String, default: '200px' }
})

const chart = ref(null)
const yName = ref('')

useChartResize(() => chart.value)

function initChart() {
  chart.value = null
  chart.value = echarts.init(document.getElementById(props.id))
  const xData = []
  if (props.dataList && props.dataList.length > 0) {
    props.dataList.forEach(function (item) {
      xData.push(item.name)
    })
  }
  const series = []
  if (props.headList && props.headList.length > 0) {
    props.headList.forEach(function (header, index) {
      const serieItem = JSON.parse(JSON.stringify(serieDataItem))
      serieItem.name = header
      serieItem.type = props.chartType
      serieItem.itemStyle.normal.color = props.color
      serieItem.data = []
      const valueList = []
      props.dataList.forEach(function (value) {
        valueList.push(value['value' + index])
      })
      serieItem.data = valueList
      series.push(serieItem)
    })
  }

  chart.value.setOption({
    backgroundColor: '#FFFFFF',
    title: {
      text: props.title,
      x: 'center',
      top: '20',
      textStyle: { color: '#333333', fontSize: '14' },
      subtextStyle: { color: '#666666', fontSize: '16' }
    },
    tooltip: {
      show: true,
      trigger: 'axis',
      axisPointer: { type: 'none', snap: false, label: { margin: 10 }, textStyle: { color: '#666666' } },
      triggerOn: 'mousemove',
      showContent: true,
      alwaysShowContent: false,
      borderWidth: 0,
      confine: false,
      formatter(p) {
        return p[0].name + ' : ' + p[0].value
      }
    },
    grid: {
      left: '5%',
      right: '5%',
      borderWidth: 0,
      top: 60,
      bottom: 50,
      textStyle: { color: '#666666' }
    },
    legend: {
      x: 'center',
      bottom: 'bottom',
      textStyle: { color: '#666666' },
      data: props.headList
    },
    calculable: true,
    xAxis: [{
      type: 'category',
      axisLine: { lineStyle: { color: '#666666' } },
      splitLine: { show: false },
      axisTick: { show: false },
      splitArea: { show: false },
      axisLabel: { interval: 0 },
      data: xData
    }],
    yAxis: [{
      type: 'value',
      name: yName.value,
      splitLine: { lineStyle: { type: 'dashed' }, show: true },
      axisLine: { lineStyle: { color: '#666666' } },
      axisTick: { show: false },
      axisLabel: { interval: 0 },
      splitArea: { show: false }
    }],
    series: series
  }, true)
}

watch(() => props.chartType, initChart)
watch(() => props.headList, initChart, { deep: true })

onMounted(() => {
  initChart()
})

onBeforeUnmount(() => {
  if (!chart.value) return
  chart.value.dispose()
  chart.value = null
})
</script>`

  return content.replace(/<script[\s\S]*?<\/script>/, script)
}

function convertVue(content, fallbackName, relPath) {
  if (relPath === 'src/views/components/charts/index.vue') {
    return convertChartsIndex(content)
  }

  const sm = content.match(/<script(\s[^>]*)?>([\s\S]*?)<\/script>/)
  if (!sm || !sm[2].includes('export default')) return null

  const scriptBody = sm[2]
  const em = scriptBody.match(/export default\s*\{([\s\S]*)\}\s*;?\s*$/)
  if (!em) return null
  const exportBody = em[1]

  if (/mixins\s*:/.test(exportBody) && relPath !== 'src/views/components/charts/index.vue') {
    return { error: 'mixins' }
  }

  const nameM = exportBody.match(/^\s*name\s*:\s*['"]([^'"]+)['"]/m)
  const compName = nameM ? nameM[1] : fallbackName

  const importLines = scriptBody.split('\n').filter((l) => /^\s*import\s/.test(l))

  let dataFields = ''
  const dataStart = exportBody.match(/\bdata\s*\(\s*\)\s*\{[\s\S]*?return\s*\{/)
  if (dataStart) {
    const braceStart = exportBody.indexOf('{', dataStart.index + dataStart[0].length - 1)
    const braceEnd = findMatchingBrace(exportBody, braceStart)
    dataFields = exportBody.slice(braceStart + 1, braceEnd).trim()
  }
  const fieldNames = [...dataFields.matchAll(/^\s*(\w+)\s*:/gm)].map((m) => m[1])

  const methodsSec = extractObjectAfterKey(exportBody, 'methods')
  const methods = methodsSec ? parseMethods(methodsSec.body) : []
  const methodNames = methods.map((m) => m.name)

  const propsSec = extractObjectAfterKey(exportBody, 'props')
  const propsArrayM2 = exportBody.match(/props\s*:\s*\[([\s\S]*?)\]/)
  const propNames = propsArrayM2
    ? propsArrayM2[1].split(',').map((s) => s.trim().replace(/['"]/g, '')).filter(Boolean)
    : propsSec
      ? [...propsSec.body.matchAll(/^\s*(\w+)\s*:/gm)].map((m) => m[1])
      : []
  const transform = buildTransform(fieldNames, methodNames, propNames)
  const watchSec = extractObjectAfterKey(exportBody, 'watch')
  const computedSec = extractObjectAfterKey(exportBody, 'computed')
  const createdSec = extractObjectAfterKey(exportBody, 'created')
  const mountedSec = extractObjectAfterKey(exportBody, 'mounted')
  const activatedSec = extractObjectAfterKey(exportBody, 'activated')
  const beforeUnmountSec =
    extractObjectAfterKey(exportBody, 'beforeDestroy') || extractObjectAfterKey(exportBody, 'beforeUnmount')

  const needsRouter = /\$router|\$route/.test(scriptBody)
  const needsStore = /\$store/.test(scriptBody)
  const needsModal = /\$modal|\$alert/.test(scriptBody)
  const needsPrompt = /\$prompt/.test(scriptBody)
  const needsAddDateRange = /addDateRange/.test(scriptBody)
  const needsDownload = /\bdownload\s*\(/.test(scriptBody) || /this\.download/.test(scriptBody)
  const needsParseTime = /parseTime/.test(scriptBody)
  const hasEmit = /\$emit/.test(scriptBody)
  const dictsMatch = exportBody.match(/dicts\s*:\s*\[([^\]]+)\]/)

  const vueImports = ['ref', 'reactive', 'computed', 'watch', 'onMounted', 'onBeforeUnmount', 'onActivated', 'nextTick', 'toRefs']
  let out = importLines.filter((l) => !l.includes("from 'vue'") && !l.includes('from "vue"')).join('\n')
  if (out) out += '\n'
  out += `import { ${vueImports.join(', ')} } from 'vue'\n`
  if (needsRouter) out += "import { useRouter, useRoute } from 'vue-router'\n"
  if (needsStore) out += "import { useStore } from 'vuex'\n"
  if (needsModal || needsPrompt) out += "import modal from '@/plugins/modal'\n"
  if (needsAddDateRange) out += "import { addDateRange, parseTime } from '@/utils/fuint'\n"
  else if (needsParseTime) out += "import { parseTime } from '@/utils/fuint'\n"
  if (needsDownload) out += "import { download } from '@/utils/request'\n"
  if (needsPrompt) out += "import { ElMessageBox } from 'element-plus'\n"
  if (dictsMatch) out += "import { useDict } from '@/composables/useDict'\n"

  out += `\ndefineOptions({ name: '${compName}' })\n\n`
  if (dictsMatch) out += `const dict = useDict(${dictsMatch[1].trim()})\n\n`
  if (needsRouter) out += 'const router = useRouter()\nconst route = useRoute()\n'
  if (needsStore) out += 'const store = useStore()\n'

  const propsArrayM = exportBody.match(/props\s*:\s*\[([\s\S]*?)\]/)
  if (propsArrayM) {
    const items = propsArrayM[1].split(',').map((s) => s.trim().replace(/['"]/g, '')).filter(Boolean)
    out += `const props = defineProps([${items.map((i) => `'${i}'`).join(', ')}])\n\n`
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
    for (const cm of computedSec.body.matchAll(/(\w+)\s*:\s*function\s*\(\)\s*\{([\s\S]*?)\n\s*\}/g)) {
      out += `const ${cm[1]} = computed(() => {${transform(cm[2])}})\n\n`
    }
    for (const cm of computedSec.body.matchAll(/(\w+)\s*\(\)\s*\{([\s\S]*?)\n\s*\}/g)) {
      if (out.includes(`const ${cm[1]} = computed`)) continue
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

  let result = content.replace(/<script(\s[^>]*)?>[\s\S]*?<\/script>/, `<script setup>\n${out.trim()}\n</script>`)

  // template ref hints
  result = result.replace(/\bref="queryForm"/g, 'ref="queryFormRef"')
  result = result.replace(/\bref="form"/g, 'ref="formRef"')
  result = result.replace(/\bref="(cron\w+)"/g, 'ref="$1Ref"')

  return result
}

const files = []
for (const r of WALK_ROOTS) walk(r, files)

const ok = []
const fail = []
const skipped = []

for (const rel of files) {
  if (SKIP.has(rel)) {
    skipped.push(rel)
    continue
  }
  const full = path.join(root, rel)
  const content = fs.readFileSync(full, 'utf8')
  if (content.includes('<script setup>')) {
    skipped.push(rel)
    continue
  }
  if (!content.includes('export default')) {
    skipped.push(rel)
    continue
  }
  try {
    const converted = convertVue(content, path.basename(rel, '.vue'), rel)
    if (!converted || converted.error) {
      fail.push({ rel, note: converted?.error || 'no convert' })
      continue
    }
    fs.writeFileSync(full, converted)
    ok.push(rel)
  } catch (e) {
    fail.push({ rel, note: e.message })
  }
}

console.log('Converted:', ok.length)
ok.forEach((r) => console.log('  OK', r))
console.log('Failed:', fail.length)
fail.forEach((r) => console.log('  FAIL', r.rel, r.note))
console.log('Skipped:', skipped.length)

export { convertVue }
