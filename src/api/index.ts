import axios from 'axios'
import { getItem } from '@/utils/storage'
import { ElMessage } from 'element-plus'
import { useStore } from '@/stores/auth'

const service = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// request interceptor
service.interceptors.request.use(
  (config) => {
    // Do something before request is sent
    const token = getItem('token')
    if (token) {
      config.headers['Authorization'] = token // 让每个请求携带自定义 token
    }
    return config
  },
  (error) => {
    // Do something with request error
    return Promise.reject(error)
  },
)

// response interceptor
service.interceptors.response.use(
  (response) => {
    // Do something with response data
    console.log('Response:', response)
    if (response.data.code === 401) {
      ElMessage.error(response.data.msg)
      useStore().logout()
    }
    if (response.data.code === 0) {
      ElMessage.error(response.data.msg)
      return Promise.reject(response.data)
    }
    return response.data
  },
  (error) => {
    // Do something with response error
    console.error('Error:', error)
    return Promise.reject(error)
  },
)

export const GET = (url: string, params = {}) => {
  return new Promise((resolve, reject) => {
    service
      .get(url, { params })
      .then((res) => {
        console.log('GET-Res:', res)
        resolve(res)
      })
      .catch((err) => {
        reject(err)
      })
  })
}

export const POST = (url: string, params = {}) => {
  return new Promise((resolve, reject) => {
    service
      .post(url, params)
      .then((res) => {
        console.log('POST-Res:', res)
        resolve(res)
      })
      .catch((err) => {
        reject(err)
      })
  })
}
