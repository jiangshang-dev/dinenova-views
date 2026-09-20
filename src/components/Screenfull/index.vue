<template>
  <div title="全屏展示" class="nav-icon">
    <svg-icon :icon-class="isFullscreen?'exit-fullscreen':'fullscreen'" @click="click" />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import screenfull from 'screenfull'

defineOptions({ name: 'Screenfull' })

const isFullscreen = ref(false)

function click() {
  if (!screenfull.isEnabled) {
    ElMessage({ message: '你的浏览器不支持全屏', type: 'warning' })
    return false
  }
  screenfull.toggle()
}

function change() {
  isFullscreen.value = screenfull.isFullscreen
}

onMounted(() => {
  if (screenfull.isEnabled) {
    screenfull.on('change', change)
  }
})

onBeforeUnmount(() => {
  if (screenfull.isEnabled) {
    screenfull.off('change', change)
  }
})
</script>

<style scoped>
.screenfull-svg {
  display: inline-block;
  cursor: pointer;
  fill: #5a5e66;;
  width: 20px;
  height: 20px;
  vertical-align: 10px;
}
</style>
