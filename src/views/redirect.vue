<script setup>
import { onBeforeMount } from 'vue'
import { useRoute, useRouter } from 'vue-router'

defineOptions({ name: 'Redirect' })

const route = useRoute()
const router = useRouter()

onBeforeMount(() => {
  const { params, query } = route
  const { path } = params
  router.replace({ path: '/' + path, query })
})
</script>

<template></template>
