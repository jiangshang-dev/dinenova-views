<template>
  <div class="editor-wrap">
    <el-upload
      v-if="type === 'url'"
      ref="upload"
      :action="uploadUrl"
      :before-upload="handleBeforeUpload"
      :on-success="handleUploadSuccess"
      :on-error="handleUploadError"
      name="file"
      :show-file-list="false"
      :headers="headers"
      style="display: none"
    />
    <div ref="editor" class="editor" :style="styles"></div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import Quill from 'quill'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
import { getToken } from '@/utils/auth'

defineOptions({ name: 'Editor' })

const props = defineProps({
  modelValue: {
    type: String,
    default: undefined
  },
  value: {
    type: String,
    default: ''
  },
  height: {
    type: Number,
    default: null
  },
  minHeight: {
    type: Number,
    default: null
  },
  readOnly: {
    type: Boolean,
    default: false
  },
  fileSize: {
    type: Number,
    default: 5
  },
  type: {
    type: String,
    default: 'url'
  }
})

const emit = defineEmits([
  'update:modelValue',
  'input',
  'on-change',
  'on-text-change',
  'on-selection-change',
  'on-editor-change'
])

const uploadUrl = (import.meta.env.VUE_APP_BASE_API || '').replace(/\/$/, '') + '/backendApi/file/upload'
const headers = { 'Access-Token': getToken() }

const upload = ref(null)
const editor = ref(null)
let quill = null
let destroyed = false
const currentValue = ref('')
const updating = ref(false)

const styles = computed(() => {
  const style = {}
  if (props.minHeight) {
    style.minHeight = `${props.minHeight}px`
  }
  if (props.height) {
    style.height = `${props.height}px`
  }
  return style
})

const currentContent = computed(() => {
  return props.modelValue === undefined ? props.value : props.modelValue
})

function safePaste(html) {
  if (destroyed || !quill || !editor.value) {
    return
  }
  try {
    updating.value = true
    quill.root.innerHTML = html || ''
  } catch (e) {
    // ignore
  } finally {
    nextTick(() => {
      updating.value = false
    })
  }
}

watch(
  currentContent,
  (val) => {
    if (destroyed || updating.value) {
      return
    }
    const next = val === null || val === undefined ? '' : val
    if (next === currentValue.value) {
      return
    }
    currentValue.value = next
    if (quill) {
      safePaste(next)
    }
  },
  { immediate: true }
)

function init() {
  if (!editor.value || destroyed) {
    return
  }
  quill = new Quill(editor.value, {
    theme: 'snow',
    bounds: document.body,
    debug: 'warn',
    modules: {
      toolbar: [
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ indent: '-1' }, { indent: '+1' }],
        [{ size: ['small', false, 'large', 'huge'] }],
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ color: [] }, { background: [] }],
        [{ align: [] }],
        ['clean'],
        ['link', 'image', 'video']
      ]
    },
    placeholder: '请输入内容',
    readOnly: props.readOnly
  })

  if (props.type === 'url') {
    const toolbar = quill.getModule('toolbar')
    toolbar.addHandler('image', (value) => {
      if (destroyed) {
        return
      }
      if (value) {
        const input = upload.value?.$el?.querySelector('input[type="file"]')
        if (input) input.click()
      } else {
        quill.format('image', false)
      }
    })
  }

  safePaste(currentValue.value)

  quill.on('text-change', (delta, oldDelta, source) => {
    if (destroyed || updating.value || !editor.value || !quill) {
      return
    }
    try {
      const html = quill.root.innerHTML
      const text = quill.getText()
      if (html === currentValue.value) {
        emit('on-text-change', delta, oldDelta, source)
        return
      }
      currentValue.value = html
      updating.value = true
      emit('update:modelValue', html)
      emit('input', html)
      emit('on-change', { html, text, quill })
      emit('on-text-change', delta, oldDelta, source)
      nextTick(() => {
        updating.value = false
      })
    } catch (e) {
      updating.value = false
    }
  })

  quill.on('selection-change', (range, oldRange, source) => {
    if (destroyed) return
    emit('on-selection-change', range, oldRange, source)
  })

  quill.on('editor-change', (eventName, ...args) => {
    if (destroyed) return
    emit('on-editor-change', eventName, ...args)
  })
}

function destroyQuill() {
  destroyed = true
  updating.value = true
  if (quill) {
    try {
      quill.off('text-change')
      quill.off('selection-change')
      quill.off('editor-change')
      quill.enable(false)
    } catch (e) {
      // ignore
    }
    quill = null
  }
  const el = editor.value
  if (el && el.parentNode) {
    try {
      // Quill 会在编辑器前插入 toolbar，离开页面时一并清掉，避免 Vue 卸载报 vnode/parentNode 空
      const toolbar = el.previousElementSibling
      if (toolbar && toolbar.classList.contains('ql-toolbar')) {
        toolbar.parentNode && toolbar.parentNode.removeChild(toolbar)
      }
      el.classList.remove('ql-container', 'ql-snow', 'ql-disabled')
      el.innerHTML = ''
    } catch (e) {
      // ignore
    }
  }
}

function handleBeforeUpload(file) {
  if (props.fileSize) {
    const isLt = file.size / 1024 / 1024 < props.fileSize
    if (!isLt) {
      ElMessage.error(`上传文件大小不能超过 ${props.fileSize} MB!`)
      return false
    }
  }
  return true
}

function handleUploadSuccess(res) {
  if (destroyed || !quill) {
    return
  }
  if (res.code == 200) {
    const range = quill.getSelection(true)
    const length = range ? range.index : 0
    quill.insertEmbed(length, 'image', res.data.url)
    quill.setSelection(length + 1)
  } else {
    ElMessage.error('图片插入失败')
  }
}

function handleUploadError() {
  ElMessage.error('图片插入失败')
}

onMounted(() => {
  destroyed = false
  init()
})

onBeforeUnmount(() => {
  destroyQuill()
})
</script>

<style>
.editor-wrap {
  position: relative;
}
.editor, .ql-toolbar {
  white-space: pre-wrap !important;
  line-height: normal !important;
}
.quill-img {
  display: none;
}
.ql-snow .ql-tooltip[data-mode="link"]::before {
  content: "请输入链接地址:";
}
.ql-snow .ql-tooltip.ql-editing a.ql-action::after {
  border-right: 0px;
  content: "保存";
  padding-right: 0px;
}

.ql-snow .ql-tooltip[data-mode="video"]::before {
  content: "请输入视频地址:";
}

.ql-snow .ql-picker.ql-size .ql-picker-label::before,
.ql-snow .ql-picker.ql-size .ql-picker-item::before {
  content: "14px";
}
.ql-snow .ql-picker.ql-size .ql-picker-label[data-value="small"]::before,
.ql-snow .ql-picker.ql-size .ql-picker-item[data-value="small"]::before {
  content: "10px";
}
.ql-snow .ql-picker.ql-size .ql-picker-label[data-value="large"]::before,
.ql-snow .ql-picker.ql-size .ql-picker-item[data-value="large"]::before {
  content: "18px";
}
.ql-snow .ql-picker.ql-size .ql-picker-label[data-value="huge"]::before,
.ql-snow .ql-picker.ql-size .ql-picker-item[data-value="huge"]::before {
  content: "32px";
}

.ql-snow .ql-picker.ql-header .ql-picker-label::before,
.ql-snow .ql-picker.ql-header .ql-picker-item::before {
  content: "文本";
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="1"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="1"]::before {
  content: "标题1";
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="2"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="2"]::before {
  content: "标题2";
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="3"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="3"]::before {
  content: "标题3";
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="4"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="4"]::before {
  content: "标题4";
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="5"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="5"]::before {
  content: "标题5";
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="6"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="6"]::before {
  content: "标题6";
}

.ql-snow .ql-picker.ql-font .ql-picker-label::before,
.ql-snow .ql-picker.ql-font .ql-picker-item::before {
  content: "标准字体";
}
.ql-snow .ql-picker.ql-font .ql-picker-label[data-value="serif"]::before,
.ql-snow .ql-picker.ql-font .ql-picker-item[data-value="serif"]::before {
  content: "衬线字体";
}
.ql-snow .ql-picker.ql-font .ql-picker-label[data-value="monospace"]::before,
.ql-snow .ql-picker.ql-font .ql-picker-item[data-value="monospace"]::before {
  content: "等宽字体";
}
</style>
