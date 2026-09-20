<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useStore } from 'vuex'

defineOptions({ name: 'App' })

const store = useStore()

const pageTitle = computed(() => {
  const settings = store.state.settings
  const name = import.meta.env.VUE_APP_TITLE
  const title = settings.dynamicTitle && settings.title
  return title ? `${title} - ${name}` : name
})

watch(
  pageTitle,
  (title) => {
    if (title) {
      document.title = title
    }
  },
  { immediate: true }
)
</script>
