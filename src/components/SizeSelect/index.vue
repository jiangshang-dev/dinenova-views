<template>
  <el-dropdown trigger="click" @command="handleSetSize">
    <div>
      <svg-icon class-name="size-icon" icon-class="size" />
    </div>
    <template #dropdown><el-dropdown-menu>
      <el-dropdown-item v-for="item of sizeOptions" :key="item.value" :disabled="size===item.value" :command="item.value">
        {{ item.label }}
      </el-dropdown-item>
    </el-dropdown-menu></template>
  </el-dropdown>
</template>

<script setup>
import { computed, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'

defineOptions({ name: 'SizeSelect' })

const route = useRoute()
const router = useRouter()
const store = useStore()

const sizeOptions = [
  { label: 'Default', value: 'default' },
  { label: 'Medium', value: 'medium' },
  { label: 'Small', value: 'small' },
  { label: 'Mini', value: 'mini' }
]

const size = computed(() => store.getters.size)

function handleSetSize(newSize) {
  store.dispatch('app/setSize', newSize)
  refreshView()
  ElMessage({
    message: 'Switch Size Success',
    type: 'success'
  })
}

function refreshView() {
  store.dispatch('tagsView/delAllCachedViews', route)
  const { fullPath } = route
  nextTick(() => {
    router.replace({
      path: '/redirect' + fullPath
    })
  })
}
</script>
