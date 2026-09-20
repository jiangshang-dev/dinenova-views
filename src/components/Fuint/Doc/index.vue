<template>
  <div title="帮助文档" class="nav-icon">
    <svg-icon icon-class="question" @click="goto" />
  </div>
</template>

<script setup>
defineOptions({ name: 'FuintDoc' })

const url = 'https://www.fuint.cn/docs/index/'

function goto() {
  window.open(url)
}
</script>
