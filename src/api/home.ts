import { GET, POST } from '@/api/index'

// 获取系统信息
export const GetSystemInfoAPI = (params = {}) => GET('/system/info', params)
