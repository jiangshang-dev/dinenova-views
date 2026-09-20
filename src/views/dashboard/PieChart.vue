<template>
  <div ref="chartEl" :class="className" :style="{height:height,width:width}" />
</template>

<script setup>
import * as echarts from 'echarts'
import 'echarts/theme/macarons'
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useChartResize } from './composables/useChartResize'

defineOptions({ name: 'PieChart' })

const props = defineProps({
className: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '300px'
    }
})

const chartEl = ref(null)
let chart = null
useChartResize(() => chart)

function initChart() {

      chart = echarts.init(chartEl.value, 'macarons')

      chart.setOption({
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        legend: {
          left: 'center',
          bottom: '10',
          data: ['Industries', 'Technology', 'Forex', 'Gold', 'Forecasts']
        },
        series: [
          {
            name: 'WEEKLY WRITE ARTICLES',
            type: 'pie',
            roseType: 'radius',
            radius: [15, 95],
            center: ['50%', '38%'],
            data: [
              { value: 320, name: 'Industries' },
              { value: 240, name: 'Technology' },
              { value: 149, name: 'Forex' },
              { value: 100, name: 'Gold' },
              { value: 59, name: 'Forecasts' }
            ],
            animationEasing: 'cubicInOut',
            animationDuration: 2600
          }
        ]
      })
    
}

onMounted(() => {
  nextTick(() => {
    initChart()
  })
})

onBeforeUnmount(() => {
  if (!chart) return
  chart.dispose()
  chart = null
})
</script>
