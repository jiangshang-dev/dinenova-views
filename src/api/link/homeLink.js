import request from '@/utils/request'

export function getLinkUrlList() {
  return request({
    url: 'backendApi/link/list',
    method: 'get'
  })
}

// 分页列表
export function getLinkList(query) {
  return request({
      url: 'backendApi/link/queryList',
      method: 'get',
      params: query
  })
}

// 查询信息
export function getLinkInfo(id) {
  return request({
    url: 'backendApi/link/info',
    method: 'get',
    params: {
      id
    }
  })
}

// 删除
export function deleteLink(id) {
  return request({
    url: 'backendApi/link/delete',
    method: 'delete',
    params: {
      id
    }
  })
}

// 保存
export function saveLink(data) {
  return request({
    url: 'backendApi/link/save',
    method: 'post',
    data: data
  })
}
