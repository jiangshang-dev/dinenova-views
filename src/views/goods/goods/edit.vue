<template>
  <goodsForm :is-edit="true" :is-add="false" />
</template>

<script setup>
import { reactive, ref } from 'vue'

import goodsForm from './goodsForm.vue'


defineOptions({ name: 'goodsEdit' })

</script>
