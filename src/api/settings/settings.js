import request from '@/utils/request'

// 分页查询桌码列表
export function getSettingsList(query) {
  return request({
    url: 'backendApi/allSetting/list',
    method: 'get',
    params: query
  })
}

// 保存店铺
export function save(data) {
  return request({
    url: 'backendApi/allSetting/save',
    method: 'post',
    data: data
  })
}

// 根据id查询信息
export function getInfo(id) {
  return request({
    url: 'backendApi/allSetting/info/' + id,
    method: 'get'
  })
}

// 删除
export function getDelete(id) {
  return request({
    url: 'backendApi/allSetting/delete/' + id,
    method: 'get'
  })
}

export function updateStatus(id, status) {
  return request({
    url: 'backendApi/allSetting/updateStatus/' + id + '/' + status,
    method: 'get'
  })
}
