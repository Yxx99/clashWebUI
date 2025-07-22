import { defineStore } from 'pinia'
import { getItem, setItem, removeItem } from '@/utils/storage'
import router from '@/router'

export const useStore = defineStore('store', {
  state: () => ({
    isLoggedIn: getItem('token') ? true : false,
    userInfo: getItem('userinfo') || {},
  }),
  actions: {
    login(userinfo) {
      setItem('userinfo', userinfo)
      setItem('token', userinfo.token)
      return true
    },
    logout() {
      this.isLoggedIn = false
      this.userInfo = {}
      removeItem('userinfo')
      removeItem('token')
      router.push('/login')
    },
  },
})
