<template>
  <div v-loading="loading" :style="'height:' + height">
    <iframe
      :src="src"
      frameborder="no"
      style="width: 100%; height: 100%"
      scrolling="auto" />
  </div>
</template>
<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

defineOptions({ name: 'IFrame' })

const props = defineProps({
  src: {
    type: String,
    required: true
  },
})

const height = ref(document.documentElement.clientHeight - 94.5 + 'px;')
const loading = ref(true)

function onResize() {
  height.value = document.documentElement.clientHeight - 94.5 + 'px;'
}

onMounted(() => {
  setTimeout(() => {
    loading.value = false
  }, 300)
  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
})
</script>
