<template>
  <div>
    <svg-icon icon-class="github" @click="goto" />
  </div>
</template>

<script setup>
defineOptions({ name: 'FuintGit' })

const url = 'https://gitee.com/fuint/fuint'

function goto() {
  window.open(url)
}
</script>
