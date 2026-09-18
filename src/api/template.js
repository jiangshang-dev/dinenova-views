import request from '@/utils/request'

// 分页查询点餐页模板列表
export function getTemplateList(query) {
  return request({
    url: 'backendApi/template/list',
    method: 'get',
    params: query
  })
}

// 查询id点餐页模板信息
export function getTemplateInfo(id) {
  return request({
    url: 'backendApi/template/info/' + id,
    method: 'get'
  })
}

// 获取小程序点餐页模板信息
export function getWxOrderTemplate(id) {
  return request({
    // url: 'clientApi/template/getWxTemplate/10003',
    url: 'clientApi/template/getWxTemplate/' + id,
    method: 'get'
  })
}

// 保存/修改点餐页模板信息
// id、   color  、  templateValue
export function saveTemplate(data) {
  return request({
    url: 'backendApi/template/save',
    method: 'post',
    data: data
  })
}

// 获取小程序首页模板信息
// storeId 店铺ID
export function getWxHomeTemplate(storeId,type) {
  return request({
    url: 'backendApi/diy/page/getPage?storeId=' + storeId + "&type=" + type,
    method: 'get'
  })
}

// 保存/修改首页模板信息
// storeId 店铺ID   params页面设置参数  、  type暂存0/发布到当前店铺1/发布到多门店2/使用上次3
export function saveHomeTemplate(data) {
  return request({
    url: 'backendApi/diy/page/editPage',
    method: 'post',
    data: data
  })
}
