<template>
    <el-form size="small">
        <el-form-item>
            <el-radio :label="1" v-model='radioValue'>
                不填，允许的通配符[, - * /]
            </el-radio>
        </el-form-item>

        <el-form-item>
            <el-radio :label="2" v-model='radioValue'>
                每年
            </el-radio>
        </el-form-item>

        <el-form-item>
            <el-radio :label="3" v-model='radioValue'>
                周期从
                <el-input-number v-model='cycle01' :min='fullYear' :max="2098" /> -
                <el-input-number v-model='cycle02' :min="cycle01 ? cycle01 + 1 : fullYear + 1" :max="2099" />
            </el-radio>
        </el-form-item>

        <el-form-item>
            <el-radio :label="4" v-model='radioValue'>
                从
                <el-input-number v-model='average01' :min='fullYear' :max="2098" /> 年开始，每
                <el-input-number v-model='average02' :min="1" :max="2099 - average01 || fullYear" /> 年执行一次
            </el-radio>

        </el-form-item>

        <el-form-item>
            <el-radio :label="5" v-model='radioValue'>
                指定
                <el-select clearable v-model="checkboxList" placeholder="可多选" multiple>
                    <el-option v-for="item in 9" :key="item" :value="item - 1 + fullYear" :label="item -1 + fullYear" />
                </el-select>
            </el-radio>
        </el-form-item>
    </el-form>
</template>

<script setup>
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
</script>
