import request from '@/utils/request'

// 生成二维码
export function createQrCode(data) {
  return request({
    url: 'backendApi/common/createQrCode',
    method: 'post',
    data: data
  })
}

// 生成带背景样式的二维码
export function createQrCodeNew(data) {
  return request({
    url: 'backendApi/common/createCode',
    method: 'post',
    data: data
  })
}

// 批量生成桌码
export function createTableCodeNew(id, width, showName, appType, styleId) {
  return request({
    url: 'backendApi/common/batchCreateTableCode',
    method: 'post',
    data: {
      id, width, showName, appType, styleId
    }
  })
}

// 上传店铺二维码背景
export function uploadQrBackground(data) {
  return request({
    url: 'backendApi/common/uploadQrBackground',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'multipart/form-data',
      repeatSubmit: false
    }
  })
}

// 删除店铺二维码背景
export function deleteQrBackground(id) {
  return request({
    url: 'backendApi/common/deleteQrBackground',
    method: 'post',
    data: { id }
  })
}

