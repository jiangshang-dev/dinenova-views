<template>
  <div :id="id" :chartType="chartType" :headList="headList" :dataList="dataList" :style="{height:height, width:width}" />
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import { useChartResize } from './composables/useChartResize'

const serieDataItem = {
    name: '',
    type: '',
    barMaxWidth: 50,
    barGap: '10%',
    itemStyle: {
      borderWidth: 1,
      borderColor: "#8fa1e6",
      areaColor: "#b0defa",
      normal: {
        color: '#59aff2',
        label: {
          show: true,
          textStyle: {
            color: '#666666'
          },
          position: 'top',
          formatter(p) {
            return p.value > 0 ? p.value : ''
          }
        }
      }
    },
    data: []
}

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
</script>
