<template>
  <div class="nav-tool">
    <img class="icon" title="收银下单" @click="goto" src="@/assets/images/cashier.svg">
    <div class="name">收银下单</div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

defineOptions({ name: 'FuintCashier' })

const router = useRouter()
const url = '/cashier/index'

function goto() {
  const routeLink = router.resolve({ path: url })
  window.open(routeLink.href, '_blank')
}
</script>
