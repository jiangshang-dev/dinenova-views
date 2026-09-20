import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const TARGETS = [
  'src/views/system',
  'src/views/tool',
  'src/views/components',
  'src/components',
]

function walk(rel, acc = []) {
  const full = path.join(root, rel)
  if (!fs.existsSync(full)) return acc
  const st = fs.statSync(full)
  if (st.isFile()) {
    if (rel.endsWith('.vue')) acc.push(full)
    return acc
  }
  for (const name of fs.readdirSync(full)) walk(path.join(rel, name), acc)
  return acc
}

const files = []
TARGETS.forEach((t) => walk(t, files))

for (const full of files) {
  if (!fs.readFileSync(full, 'utf8').includes('<script setup>')) continue
  let c = fs.readFileSync(full, 'utf8')
  const orig = c

  c = c.replace(/\bthis\.formRef\.value/g, 'formRef.value')
  c = c.replace(/\bthis\.queryFormRef\.value/g, 'queryFormRef.value')
  c = c.replace(/\bthis\.dateRange\b/g, 'dateRange.value')
  c = c.replace(/\bthis\.\$tab\./g, 'tab.')
  c = c.replace(/\bthis\.handleTree\b/g, 'handleTree')
  c = c.replace(/\bthis\.crontabValueString\b/g, 'crontabValueString.value')
  c = c.replace(/\bthis\.cycleTotal\b/g, 'cycleTotal.value')
  c = c.replace(/\bthis\.averageTotal\b/g, 'averageTotal.value')
  c = c.replace(/\bthis\.checkboxString\b/g, 'checkboxString.value')
  c = c.replace(/\bthis\.weekdayCheck\b/g, 'weekdayCheck.value')
  c = c.replace(/\bthis\.workdayCheck\b/g, 'workdayCheck.value')
  c = c.replace(/\bthis\.\$options\.propsData\.ex\b/g, 'props.ex')
  c = c.replace(/\bthis\.\$options\.propsData\.check\b/g, 'props.check')
  c = c.replace(/\barr\.sort\(this\.compare\)/g, 'arr.sort(compare)')
  c = c.replace(/\bthis\.compare\b/g, 'compare')
  c = c.replace(/\bthis\.list\b/g, 'list.value')
  c = c.replace(/\bthis\.fileList\b/g, 'fileList.value')
  c = c.replace(/\bthis\.routers\b/g, 'routers.value')
  c = c.replace(/\bthis\.childrenMenus\b/g, 'childrenMenus.value')
  c = c.replace(/\bthis\.show\b/g, 'show.value')
  c = c.replace(/\bthis\.closeSidebar\b/g, 'closeSidebar')
  c = c.replace(/\bthis\.setTheme\b/g, 'setTheme')
  c = c.replace(/\bthis\.\$message\./g, 'ElMessage.')
  c = c.replace(/\bthis\.\$confirm\(/g, 'ElMessageBox.confirm(')
  c = c.replace(/\bthis\.multiple\b/g, 'props.multiple')
  c = c.replace(/\bthis\.\$store\.getters/g, 'store.getters')

  // broken reactive checkNum init
  c = c.replace(/,?\s*checkNum:\s*this\.(\$options\.propsData\.)?check\s*\n/g, '\n')
  c = c.replace(/,?\s*checkNum:\s*props\.check\s*\n/g, '\n')

  // remove bogus computed from bad parse
  c = c.replace(/\nconst function = computed\([\s\S]*?\)\n/g, '\n')

  // watch(ex) -> props
  c = c.replace(/\nwatch\(ex, expressionChange\)/g, '\nwatch(() => props.ex, expressionChange)')

  // template this.fileList
  c = c.replace(/:class="\{hide: this\.fileList/g, ':class="{hide: fileList')

  if (/\btab\./.test(c) && !c.includes("from '@/plugins/tab'")) {
    c = c.replace(
      /(<script setup>\n)/,
      "$1import tab from '@/plugins/tab'\n"
    )
  }
  if (/\bhandleTree\(/.test(c) && !c.includes('handleTree')) {
    c = c.replace(
      /(<script setup>\n)/,
      "$1import { handleTree } from '@/utils/fuint'\n"
    )
  }
  if (/\bElMessage\./.test(c) && !c.includes("from 'element-plus'")) {
    c = c.replace(
      /(<script setup>\n)/,
      "$1import { ElMessage, ElMessageBox } from 'element-plus'\n"
    )
  }

  if (full.includes('Crontab/index.vue')) {
    c = fixCrontabIndex(c)
  }

  if (c !== orig) fs.writeFileSync(full, c)
}

function fixCrontabIndex(c) {
  const refsBlock = `const cronsecondRef = ref(null)
const cronminRef = ref(null)
const cronhourRef = ref(null)
const crondayRef = ref(null)
const cronmonthRef = ref(null)
const cronweekRef = ref(null)
const cronyearRef = ref(null)

const cronRefMap = {
  second: cronsecondRef,
  min: cronminRef,
  hour: cronhourRef,
  day: crondayRef,
  month: cronmonthRef,
  week: cronweekRef,
  year: cronyearRef,
}
`

  if (!c.includes('cronRefMap')) {
    c = c.replace(
      /const emit = defineEmits\(\[\]\)\n\n/,
      `const emit = defineEmits(['hide', 'fill'])\n\n${refsBlock}`
    )
  }

  c = c.replace(
    /let arr = \["second", "min", "hour", "month"\],\s*refName = "cron" \+ name,\s*insValue;\s*if \(!\(refNameRef\.value\)\) return;/,
    `let arr = ["second", "min", "hour", "month"],
        insValue;
      const compRef = cronRefMap[name];
      if (!compRef?.value) return;
      const refInst = compRef.value;`
  )

  c = c.replace(/\(refNameRef\.value\)/g, 'refInst')
  c = c.replace(/refNameRef\.value/g, 'refInst')

  return c
}

console.log('fix pass done')
