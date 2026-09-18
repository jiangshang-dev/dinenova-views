export function registerElementIcons(app, h) {
  const names = ['el-icon--right', 'el-icon-arrow-down', 'el-icon-back', 'el-icon-caret-bottom', 'el-icon-circle-close', 'el-icon-circle-plus-outline', 'el-icon-close', 'el-icon-copy-document', 'el-icon-d-arrow-right', 'el-icon-delete', 'el-icon-document', 'el-icon-document-add', 'el-icon-document-copy', 'el-icon-download', 'el-icon-edit', 'el-icon-full-screen', 'el-icon-goods', 'el-icon-key', 'el-icon-link', 'el-icon-loading', 'el-icon-menu', 'el-icon-minus', 'el-icon-mobile', 'el-icon-notebook-2', 'el-icon-picture-outline', 'el-icon-plus', 'el-icon-question', 'el-icon-refresh', 'el-icon-refresh-left', 'el-icon-refresh-right', 'el-icon-remove', 'el-icon-remove-outline', 'el-icon-right', 'el-icon-s-operation', 'el-icon-s-order', 'el-icon-search', 'el-icon-setting', 'el-icon-sort', 'el-icon-thumb', 'el-icon-time', 'el-icon-upload', 'el-icon-upload2', 'el-icon-view', 'el-icon-wrapper']
  names.forEach((name) => {
    app.component(name, { name, render() { return h('i', { class: name }) } })
  })
}
