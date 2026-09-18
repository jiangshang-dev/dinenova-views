import { createApp, h } from 'vue'
import Cookies from 'js-cookie'
import ElementPlus from 'element-plus'
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'
import '@/assets/styles/element-variables.scss'
import '@/assets/styles/index.scss'
import '@/assets/styles/fuint.scss'
import '@/assets/styles/element-icons.css'
import '@/assets/font/iconfont.css'
import '@/assets/font/myIcon.css'
import '@/assets/styles/diy.scss'
import App from './App.vue'
import store from './store'
import router from './router'
import directive from './directive'
import plugins from './plugins'
import { download } from '@/utils/request'
import 'virtual:svg-icons-register'
import SvgIcon from '@/components/SvgIcon/index.vue'
import './permission'
import { getConfigKey } from '@/api/system/config'
import { parseTime, resetForm, addDateRange, getName, handleTree } from '@/utils/fuint'
import Pagination from '@/components/Pagination'
import RightToolbar from '@/components/RightToolbar'
import Editor from '@/components/Editor'
import FileUpload from '@/components/FileUpload'
import ImageUpload from '@/components/ImageUpload'
import ImagePreview from '@/components/ImagePreview'
import DictTag from '@/components/DictTag'
import DictData from '@/components/DictData'
import Print from 'vue3-print-nb'
import TreeSelect from '@/components/TreeSelect'
import UserSelect from '@/components/UserSelect'
import { registerElementIcons } from '@/utils/elementIcons'

const app = createApp(App)

const sizeMap = { medium: 'default', mini: 'small' }
const rawSize = Cookies.get('size') || 'default'

app.config.globalProperties.getConfigKey = getConfigKey
app.config.globalProperties.parseTime = parseTime
app.config.globalProperties.resetForm = resetForm
app.config.globalProperties.addDateRange = addDateRange
app.config.globalProperties.getName = getName
app.config.globalProperties.download = download
app.config.globalProperties.handleTree = handleTree
app.config.globalProperties.$set = (target, key, value) => {
  target[key] = value
  return value
}
app.config.globalProperties.$message = ElMessage
app.config.globalProperties.$msgbox = ElMessageBox
app.config.globalProperties.$alert = ElMessageBox.alert
app.config.globalProperties.$confirm = ElMessageBox.confirm
app.config.globalProperties.$prompt = ElMessageBox.prompt
app.config.globalProperties.$notify = ElNotification
app.config.globalProperties.$delete = (target, key) => {
  delete target[key]
}
const dragKeys = new WeakMap()
let dragSeq = 1
app.config.globalProperties.dragItemKey = (el) => {
  if (!el || typeof el !== 'object') {
    return dragSeq++
  }
  if (!dragKeys.has(el)) {
    dragKeys.set(el, dragSeq++)
  }
  return dragKeys.get(el)
}
app.config.globalProperties.$addPrefix = (url) => {
  if (!url) {
    return ''
  }
  const prefix = 'https://mallapi.knowledge-code.com/api/static/'
  if (String(url).indexOf('http') === -1) {
    return prefix + url
  }
  return url
}

app.component('svg-icon', SvgIcon)
app.component('DictTag', DictTag)
app.component('Pagination', Pagination)
app.component('RightToolbar', RightToolbar)
app.component('Editor', Editor)
app.component('FileUpload', FileUpload)
app.component('ImageUpload', ImageUpload)
app.component('ImagePreview', ImagePreview)
app.component('TreeSelect', TreeSelect)
app.component('UserSelect', UserSelect)

registerElementIcons(app, h)
app.use(directive)
app.use(plugins)
app.use(Print)
DictData.install(app)
app.use(store)
app.use(router)
app.use(ElementPlus, {
  locale: zhCn,
  size: sizeMap[rawSize] || rawSize
})
app.mount('#app')
