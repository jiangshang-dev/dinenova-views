import { reactive, onBeforeMount } from 'vue'
import Dict from '@/utils/dict/Dict'

/** Vue3 script setup 替代 Options API dicts 选项 */
export function useDict(...types) {
  const dict = reactive({ type: {}, label: {} })
  onBeforeMount(() => {
    const d = new Dict()
    d.init(types).then(() => {
      Object.keys(d.type).forEach((key) => {
        dict.type[key] = d.type[key]
        dict.label[key] = d.label[key]
      })
    })
  })
  return dict
}
