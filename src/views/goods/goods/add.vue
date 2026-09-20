<template>
  <goodsForm :is-edit="false" :is-add="true" />
</template>

<script setup>
import goodsForm from './goodsForm.vue'


defineOptions({ name: 'goodsAdd' })

</script>
