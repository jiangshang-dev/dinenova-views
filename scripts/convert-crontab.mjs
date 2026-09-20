import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../src/components/Crontab')

function replaceScript(file, scriptBody) {
  const full = path.join(dir, file)
  let c = fs.readFileSync(full, 'utf8')
  c = c.replace(/<script[\s\S]*?<\/script>/, `<script setup>\n${scriptBody.trim()}\n</script>`)
  fs.writeFileSync(full, c)
}

function fieldScript(name, field, opts) {
  const {
    emitFrom = field,
    extraEmitArg = false,
    radioParent = false,
    cycleMin,
    cycleMax,
    cycle02Max,
    avgMin,
    avgMax,
    avg02Max,
    optionCount,
    optionZeroBased = true,
    initial = { radioValue: 1, cycle01: 1, cycle02: 2, average01: 0, average02: 1 },
  } = opts
  const emitArgs = extraEmitArg ? `'${field}', val, '${emitFrom}'` : `'${field}', val`
  return `
import { ref, computed, watch } from 'vue'

defineOptions({ name: '${name}' })

const props = defineProps(['check', 'cron'${radioParent ? ", 'radioParent'" : ''}])
const emit = defineEmits(['update'])

const radioValue = ref(${initial.radioValue})
const cycle01 = ref(${initial.cycle01})
const cycle02 = ref(${initial.cycle02})
const average01 = ref(${initial.average01})
const average02 = ref(${initial.average02})
const checkboxList = ref([])

defineExpose({ radioValue, cycle01, cycle02, average01, average02, checkboxList })

const cycleTotal = computed(() => {
  const c1 = props.check(cycle01.value, ${cycleMin}, ${cycleMax})
  const c2 = props.check(cycle02.value, c1 ? c1 + 1 : 1, ${cycle02Max})
  return c1 + '-' + c2
})

const averageTotal = computed(() => {
  const a1 = props.check(average01.value, ${avgMin}, ${avgMax})
  const a2 = props.check(average02.value, 1, ${avg02Max})
  return a1 + '/' + a2
})

const checkboxString = computed(() => {
  const str = checkboxList.value.join()
  return str == '' ? '*' : str
})

function radioChange() {
  switch (radioValue.value) {
    case 1:
      emit('update', '${field}', '*', ${extraEmitArg ? `'${emitFrom}'` : 'undefined'})
      break
    case 2:
      emit('update', ${emitArgs.replace('val', 'cycleTotal.value')})
      break
    case 3:
      emit('update', ${emitArgs.replace('val', 'averageTotal.value')})
      break
    case 4:
      emit('update', ${emitArgs.replace('val', 'checkboxString.value')})
      break
  }
}

function cycleChange() {
  if (radioValue.value == 2) emit('update', ${emitArgs.replace('val', 'cycleTotal.value')})
}

function averageChange() {
  if (radioValue.value == 3) emit('update', ${emitArgs.replace('val', 'averageTotal.value')})
}

function checkboxChange() {
  if (radioValue.value == 4) emit('update', ${emitArgs.replace('val', 'checkboxString.value')})
}

watch(radioValue, radioChange)
watch(cycleTotal, cycleChange)
watch(averageTotal, averageChange)
watch(checkboxString, checkboxChange)
${radioParent ? `\nwatch(() => props.radioParent, (val) => { if (val !== undefined) radioValue.value = val })` : ''}
`
}

// Fix emit for second - original passes 4 args on case 1 only; simplify to match original behavior in read second.vue

replaceScript('second.vue', `
import { ref, computed, watch } from 'vue'
defineOptions({ name: 'crontab-second' })
const props = defineProps(['check', 'radioParent'])
const emit = defineEmits(['update'])
const radioValue = ref(1)
const cycle01 = ref(1)
const cycle02 = ref(2)
const average01 = ref(0)
const average02 = ref(1)
const checkboxList = ref([])
defineExpose({ radioValue, cycle01, cycle02, average01, average02, checkboxList })
const cycleTotal = computed(() => {
  const c1 = props.check(cycle01.value, 0, 58)
  const c2 = props.check(cycle02.value, c1 ? c1 + 1 : 1, 59)
  return c1 + '-' + c2
})
const averageTotal = computed(() => {
  const a1 = props.check(average01.value, 0, 58)
  const a2 = props.check(average02.value, 1, 59 - a1 || 0)
  return a1 + '/' + a2
})
const checkboxString = computed(() => {
  const str = checkboxList.value.join()
  return str == '' ? '*' : str
})
function radioChange() {
  switch (radioValue.value) {
    case 1: emit('update', 'second', '*', 'second'); break
    case 2: emit('update', 'second', cycleTotal.value); break
    case 3: emit('update', 'second', averageTotal.value); break
    case 4: emit('update', 'second', checkboxString.value); break
  }
}
function cycleChange() { if (radioValue.value == 2) emit('update', 'second', cycleTotal.value) }
function averageChange() { if (radioValue.value == 3) emit('update', 'second', averageTotal.value) }
function checkboxChange() { if (radioValue.value == 4) emit('update', 'second', checkboxString.value) }
watch(radioValue, radioChange)
watch(cycleTotal, cycleChange)
watch(averageTotal, averageChange)
watch(checkboxString, checkboxChange)
watch(() => props.radioParent, (val) => { if (val !== undefined) radioValue.value = val })
`)

replaceScript('min.vue', `
import { ref, computed, watch } from 'vue'
defineOptions({ name: 'crontab-min' })
const props = defineProps(['check', 'cron'])
const emit = defineEmits(['update'])
const radioValue = ref(1)
const cycle01 = ref(1)
const cycle02 = ref(2)
const average01 = ref(0)
const average02 = ref(1)
const checkboxList = ref([])
defineExpose({ radioValue, cycle01, cycle02, average01, average02, checkboxList })
const cycleTotal = computed(() => {
  const c1 = props.check(cycle01.value, 0, 58)
  const c2 = props.check(cycle02.value, c1 ? c1 + 1 : 1, 59)
  return c1 + '-' + c2
})
const averageTotal = computed(() => {
  const a1 = props.check(average01.value, 0, 58)
  const a2 = props.check(average02.value, 1, 59 - a1 || 0)
  return a1 + '/' + a2
})
const checkboxString = computed(() => {
  const str = checkboxList.value.join()
  return str == '' ? '*' : str
})
function radioChange() {
  switch (radioValue.value) {
    case 1: emit('update', 'min', '*', 'min'); break
    case 2: emit('update', 'min', cycleTotal.value, 'min'); break
    case 3: emit('update', 'min', averageTotal.value, 'min'); break
    case 4: emit('update', 'min', checkboxString.value, 'min'); break
  }
}
function cycleChange() { if (radioValue.value == 2) emit('update', 'min', cycleTotal.value, 'min') }
function averageChange() { if (radioValue.value == 3) emit('update', 'min', averageTotal.value, 'min') }
function checkboxChange() { if (radioValue.value == 4) emit('update', 'min', checkboxString.value, 'min') }
watch(radioValue, radioChange)
watch(cycleTotal, cycleChange)
watch(averageTotal, averageChange)
watch(checkboxString, checkboxChange)
`)

replaceScript('hour.vue', `
import { ref, computed, watch } from 'vue'
defineOptions({ name: 'crontab-hour' })
const props = defineProps(['check', 'cron'])
const emit = defineEmits(['update'])
const radioValue = ref(1)
const cycle01 = ref(0)
const cycle02 = ref(1)
const average01 = ref(0)
const average02 = ref(1)
const checkboxList = ref([])
defineExpose({ radioValue, cycle01, cycle02, average01, average02, checkboxList })
const cycleTotal = computed(() => {
  const c1 = props.check(cycle01.value, 0, 22)
  const c2 = props.check(cycle02.value, c1 ? c1 + 1 : 1, 23)
  return c1 + '-' + c2
})
const averageTotal = computed(() => {
  const a1 = props.check(average01.value, 0, 22)
  const a2 = props.check(average02.value, 1, 23 - a1 || 0)
  return a1 + '/' + a2
})
const checkboxString = computed(() => {
  const str = checkboxList.value.join()
  return str == '' ? '*' : str
})
function radioChange() {
  switch (radioValue.value) {
    case 1: emit('update', 'hour', '*'); break
    case 2: emit('update', 'hour', cycleTotal.value); break
    case 3: emit('update', 'hour', averageTotal.value); break
    case 4: emit('update', 'hour', checkboxString.value); break
  }
}
function cycleChange() { if (radioValue.value == 2) emit('update', 'hour', cycleTotal.value) }
function averageChange() { if (radioValue.value == 3) emit('update', 'hour', averageTotal.value) }
function checkboxChange() { if (radioValue.value == 4) emit('update', 'hour', checkboxString.value) }
watch(radioValue, radioChange)
watch(cycleTotal, cycleChange)
watch(averageTotal, averageChange)
watch(checkboxString, checkboxChange)
`)

replaceScript('month.vue', `
import { ref, computed, watch } from 'vue'
defineOptions({ name: 'crontab-month' })
const props = defineProps(['check', 'cron'])
const emit = defineEmits(['update'])
const radioValue = ref(1)
const cycle01 = ref(1)
const cycle02 = ref(2)
const average01 = ref(1)
const average02 = ref(1)
const checkboxList = ref([])
defineExpose({ radioValue, cycle01, cycle02, average01, average02, checkboxList })
const cycleTotal = computed(() => {
  const c1 = props.check(cycle01.value, 1, 11)
  const c2 = props.check(cycle02.value, c1 ? c1 + 1 : 2, 12)
  return c1 + '-' + c2
})
const averageTotal = computed(() => {
  const a1 = props.check(average01.value, 1, 11)
  const a2 = props.check(average02.value, 1, 12 - a1 || 0)
  return a1 + '/' + a2
})
const checkboxString = computed(() => {
  const str = checkboxList.value.join()
  return str == '' ? '*' : str
})
function radioChange() {
  switch (radioValue.value) {
    case 1: emit('update', 'month', '*'); break
    case 2: emit('update', 'month', cycleTotal.value); break
    case 3: emit('update', 'month', averageTotal.value); break
    case 4: emit('update', 'month', checkboxString.value); break
  }
}
function cycleChange() { if (radioValue.value == 2) emit('update', 'month', cycleTotal.value) }
function averageChange() { if (radioValue.value == 3) emit('update', 'month', averageTotal.value) }
function checkboxChange() { if (radioValue.value == 4) emit('update', 'month', checkboxString.value) }
watch(radioValue, radioChange)
watch(cycleTotal, cycleChange)
watch(averageTotal, averageChange)
watch(checkboxString, checkboxChange)
`)

replaceScript('day.vue', `
import { ref, computed, watch } from 'vue'
defineOptions({ name: 'crontab-day' })
const props = defineProps(['check', 'cron'])
const emit = defineEmits(['update'])
const radioValue = ref(1)
const workday = ref(1)
const cycle01 = ref(1)
const cycle02 = ref(2)
const average01 = ref(1)
const average02 = ref(1)
const checkboxList = ref([])
defineExpose({ radioValue, workday, cycle01, cycle02, average01, average02, checkboxList })
const cycleTotal = computed(() => {
  const c1 = props.check(cycle01.value, 1, 30)
  const c2 = props.check(cycle02.value, c1 ? c1 + 1 : 2, 31)
  return c1 + '-' + c2
})
const averageTotal = computed(() => {
  const a1 = props.check(average01.value, 1, 30)
  const a2 = props.check(average02.value, 1, 31 - a1 || 0)
  return a1 + '/' + a2
})
const workdayCheck = computed(() => props.check(workday.value, 1, 31))
const checkboxString = computed(() => {
  const str = checkboxList.value.join()
  return str == '' ? '*' : str
})
function radioChange() {
  ('day rachange')
  if (radioValue.value !== 2 && props.cron?.week !== '?') {
    emit('update', 'week', '?', 'day')
  }
  switch (radioValue.value) {
    case 1: emit('update', 'day', '*'); break
    case 2: emit('update', 'day', '?'); break
    case 3: emit('update', 'day', cycleTotal.value); break
    case 4: emit('update', 'day', averageTotal.value); break
    case 5: emit('update', 'day', workdayCheck.value + 'W'); break
    case 6: emit('update', 'day', 'L'); break
    case 7: emit('update', 'day', checkboxString.value); break
  }
  ('day rachange end')
}
function cycleChange() { if (radioValue.value == 3) emit('update', 'day', cycleTotal.value) }
function averageChange() { if (radioValue.value == 4) emit('update', 'day', averageTotal.value) }
function workdayChange() { if (radioValue.value == 5) emit('update', 'day', workdayCheck.value + 'W') }
function checkboxChange() { if (radioValue.value == 7) emit('update', 'day', checkboxString.value) }
watch(radioValue, radioChange)
watch(cycleTotal, cycleChange)
watch(averageTotal, averageChange)
watch(workdayCheck, workdayChange)
watch(checkboxString, checkboxChange)
`)

replaceScript('week.vue', `
import { ref, computed, watch } from 'vue'
defineOptions({ name: 'crontab-week' })
const props = defineProps(['check', 'cron'])
const emit = defineEmits(['update'])
const radioValue = ref(2)
const weekday = ref(2)
const cycle01 = ref(2)
const cycle02 = ref(3)
const average01 = ref(1)
const average02 = ref(2)
const checkboxList = ref([])
const weekList = [
  { key: 2, value: '星期一' },
  { key: 3, value: '星期二' },
  { key: 4, value: '星期三' },
  { key: 5, value: '星期四' },
  { key: 6, value: '星期五' },
  { key: 7, value: '星期六' },
  { key: 1, value: '星期日' }
]
defineExpose({ radioValue, weekday, cycle01, cycle02, average01, average02, checkboxList })
const cycleTotal = computed(() => {
  cycle01.value = props.check(cycle01.value, 1, 7)
  cycle02.value = props.check(cycle02.value, 1, 7)
  return cycle01.value + '-' + cycle02.value
})
const averageTotal = computed(() => {
  average01.value = props.check(average01.value, 1, 4)
  average02.value = props.check(average02.value, 1, 7)
  return average02.value + '#' + average01.value
})
const weekdayCheck = computed(() => {
  weekday.value = props.check(weekday.value, 1, 7)
  return weekday.value
})
const checkboxString = computed(() => {
  const str = checkboxList.value.join()
  return str == '' ? '*' : str
})
function radioChange() {
  if (radioValue.value !== 2 && props.cron?.day !== '?') {
    emit('update', 'day', '?', 'week')
  }
  switch (radioValue.value) {
    case 1: emit('update', 'week', '*'); break
    case 2: emit('update', 'week', '?'); break
    case 3: emit('update', 'week', cycleTotal.value); break
    case 4: emit('update', 'week', averageTotal.value); break
    case 5: emit('update', 'week', weekdayCheck.value + 'L'); break
    case 6: emit('update', 'week', checkboxString.value); break
  }
}
function cycleChange() { if (radioValue.value == 3) emit('update', 'week', cycleTotal.value) }
function averageChange() { if (radioValue.value == 4) emit('update', 'week', averageTotal.value) }
function weekdayChange() { if (radioValue.value == 5) emit('update', 'week', weekday.value + 'L') }
function checkboxChange() { if (radioValue.value == 6) emit('update', 'week', checkboxString.value) }
watch(radioValue, radioChange)
watch(cycleTotal, cycleChange)
watch(averageTotal, averageChange)
watch(weekdayCheck, weekdayChange)
watch(checkboxString, checkboxChange)
`)

replaceScript('year.vue', `
import { ref, computed, watch, onMounted } from 'vue'
defineOptions({ name: 'crontab-year' })
const props = defineProps(['check', 'month', 'cron'])
const emit = defineEmits(['update'])
const fullYear = ref(0)
const radioValue = ref(1)
const cycle01 = ref(0)
const cycle02 = ref(0)
const average01 = ref(0)
const average02 = ref(1)
const checkboxList = ref([])
defineExpose({ radioValue, cycle01, cycle02, average01, average02, checkboxList })
const cycleTotal = computed(() => {
  const c1 = props.check(cycle01.value, fullYear.value, 2098)
  const c2 = props.check(cycle02.value, c1 ? c1 + 1 : fullYear.value + 1, 2099)
  return c1 + '-' + c2
})
const averageTotal = computed(() => {
  const a1 = props.check(average01.value, fullYear.value, 2098)
  const a2 = props.check(average02.value, 1, 2099 - a1 || fullYear.value)
  return a1 + '/' + a2
})
const checkboxString = computed(() => checkboxList.value.join())
function radioChange() {
  switch (radioValue.value) {
    case 1: emit('update', 'year', ''); break
    case 2: emit('update', 'year', '*'); break
    case 3: emit('update', 'year', cycleTotal.value); break
    case 4: emit('update', 'year', averageTotal.value); break
    case 5: emit('update', 'year', checkboxString.value); break
  }
}
function cycleChange() { if (radioValue.value == 3) emit('update', 'year', cycleTotal.value) }
function averageChange() { if (radioValue.value == 4) emit('update', 'year', averageTotal.value) }
function checkboxChange() { if (radioValue.value == 5) emit('update', 'year', checkboxString.value) }
watch(radioValue, radioChange)
watch(cycleTotal, cycleChange)
watch(averageTotal, averageChange)
watch(checkboxString, checkboxChange)
onMounted(() => {
  fullYear.value = Number(new Date().getFullYear())
  cycle01.value = fullYear.value
  average01.value = fullYear.value
})
`)

console.log('crontab conversion done')
