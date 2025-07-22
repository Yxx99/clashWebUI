import { GET, POST } from '@/api/index'

// 获取订阅列表
export const GetSubscriptionListAPI = (params = {}) => GET('/subscription/list', params)

// 修改订阅
export const ModifySubscriptionAPI = (params = {}) => POST('/subscription/modify', params)

// 删除订阅
export const DeleteSubscriptionAPI = (params = {}) => POST('/subscription/delete', params)

// 更新订阅信息
export const UpdateSubscriptionAPI = (params = {}) => POST('/subscription/update', params)
