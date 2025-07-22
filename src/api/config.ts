import { GET, POST } from '@/api/index'

// 获取配置列表
export const GetConfigListAPI = (params = {}) => POST('/config/list', params)

// 新增或编辑配置
export const SaveConfigAPI = (params = {}) => POST('/config/save', params)

// 删除配置
export const DeleteConfigAPI = (params = {}) => POST('/config/delete', params)

// 获取订阅列表
export const GetSubscriptionListAPI = (params = {}) => POST('/config/sublist', params)
