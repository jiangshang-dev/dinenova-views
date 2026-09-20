<template>
  <div v-if="url" :style="frameStyle">
    <iframe
      :src="url"
      frameborder="no"
      style="width: 100%; height: 100%"
      scrolling="auto" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

defineOptions({ name: 'InnerLink' })

const route = useRoute()

const url = computed(() => {
  const link = route.meta?.link
  return link || ''
})

const frameStyle = computed(() => ({
  height: document.documentElement.clientHeight - 94.5 + 'px'
}))
</script>
