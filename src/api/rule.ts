import { GET, POST } from '@/api/index'

// 获取规则列表
export const GetRuleListAPI = (params = {}) => POST('/rule/list', params)

// 获取可用的代理或策略
export const GetPolicyListAPI = (params = {}) => GET('/rule/policy', params)

// 新增或编辑规则
export const SaveRuleAPI = (params = {}) => POST('/rule/save', params)

// 启用或禁用规则
export const ChangeRuleStatusAPI = (params = {}) => POST('/rule/status', params)

// 删除规则
export const DeleteRuleAPI = (params = {}) => POST('/rule/delete', params)
