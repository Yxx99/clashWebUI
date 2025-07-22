import { GET, POST } from '@/api/index'

// 登录
export const LoginAPI = (params = {}) => POST('/login', params)

// 退出登录
export const LogoutAPI = (params = {}) => GET('/logout', params)
