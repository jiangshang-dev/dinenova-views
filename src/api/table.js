import request from '@/utils/request'

// 分页查询桌码列表
export function getTableList(query) {
  return request({
      url: 'backendApi/table/list',
      method: 'get',
      params: query
  })
}

// 查询桌码信息
export function getTableInfo(tableId) {
  return request({
    url: 'backendApi/table/info/' + tableId,
    method: 'get'
  })
}

// 更新桌码状态
export function updateTableStatus(id, status) {
  const data = {
    id,
    status
  }
  return request({
      url: 'backendApi/table/updateStatus',
      method: 'post',
      data: data
  })
}

// 保存桌码信息
export function saveTable(data) {
  return request({
    url: 'backendApi/table/save',
    method: 'post',
    data: data
  })
}
