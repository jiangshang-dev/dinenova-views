<template>
  <div ref="root">
    <template v-for="(element, index) in list" :key="rowKey(element, index)">
      <slot name="item" :element="element" :index="index" />
    </template>
  </div>
</template>

<script setup>
import Sortable from 'sortablejs'
import { ref, computed, onMounted, onBeforeUnmount, getCurrentInstance } from 'vue'

defineOptions({ name: 'DraggableList' })

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
  itemKey: {
    type: [String, Function],
    default: undefined,
  },
  group: {
    type: [String, Object],
    default: undefined,
  },
})

const emit = defineEmits(['update:modelValue'])

const root = ref(null)
const instance = getCurrentInstance()
let sortable = null

const list = computed(() => (Array.isArray(props.modelValue) ? props.modelValue : []))

function rowKey(element, index) {
  if (typeof props.itemKey === 'function') {
    const key = props.itemKey(element)
    return key == null ? index : key
  }
  if (typeof props.itemKey === 'string' && element && element[props.itemKey] != null) {
    return element[props.itemKey]
  }
  return index
}

function onDragEnd(evt) {
  const { oldIndex, newIndex, item, from } = evt
  if (oldIndex == null || newIndex == null || oldIndex === newIndex) {
    return
  }
  if (item.parentNode === from) {
    from.removeChild(item)
    const refEl = from.children[oldIndex]
    if (refEl) {
      from.insertBefore(item, refEl)
    } else {
      from.appendChild(item)
    }
  }
  const next = list.value.slice()
  const moved = next.splice(oldIndex, 1)[0]
  next.splice(newIndex, 0, moved)
  emit('update:modelValue', next)
}

onMounted(() => {
  sortable = Sortable.create(root.value, {
    animation: 150,
    group: props.group || {
      name: 'diy-list-' + instance.uid,
      pull: false,
      put: false,
    },
    filter:
      'input,textarea,button,select,option,a,.btn-del,.el-slider,.el-input,.el-button,.el-upload,.el-color-picker',
    preventOnFilter: false,
    onEnd: (evt) => onDragEnd(evt),
  })
})

onBeforeUnmount(() => {
  if (sortable) {
    sortable.destroy()
    sortable = null
  }
})
</script>
