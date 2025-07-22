import { GET, POST } from '@/api/index'

// 获取订阅列表
export const GetSubListAPI = (params = {}) => GET('/clash/proxy/subs', params)

// 获取代理列表
export const GetProxyListAPI = (params = {}) => POST('/clash/proxy/list', params)

// 切换状态
export const ChangeProxyStatusAPI = (params = {}) => POST('/clash/proxy/status', params)

// 编辑代理
export const EditProxyAPI = (params = {}) => POST('/clash/proxy/edit', params)

// 删除代理
export const DeleteProxyAPI = (params = {}) => POST('/clash/proxy/delete', params)

// 获取可以选择的分组成员
export const GetSelectMembersAPI = (params = {}) => GET('/clash/clash/members', params)

// 新增、修改分组
export const ModifyGroupAPI = (params = {}) => POST('/clash/clash/group_modify', params)

// 分组列表
export const GetGroupListAPI = (params = {}) => POST('/clash/clash/group_list', params)
