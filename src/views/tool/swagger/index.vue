<template>
  <i-frame :src="url" />
</template>
<script setup>
import { ref } from 'vue'
import iFrame from '@/components/iFrame/index'

defineOptions({ name: 'Swagger' })

const url = ref(import.meta.env.VUE_APP_BASE_API + '/swagger-ui/index.html')
</script>
