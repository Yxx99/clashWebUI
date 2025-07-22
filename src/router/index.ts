import { createRouter, createWebHashHistory } from 'vue-router'
import Layout from '../components/Layout.vue'
import Login from '../views/Login.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Layout,
      meta: {
        title: '首页',
      },
      children: [
        {
          path: '/',
          name: 'dashboard',
          component: () => import('@/views/Home.vue'),
          meta: {
            title: '仪表盘',
            icon: 'HomeFilled',
            hidden: false,
          },
        },
        {
          path: '/clash/config',
          name: 'clash-config',
          component: () => import('@/views/clash/Config.vue'),
          meta: {
            title: '配置管理',
            icon: 'Setting',
            hidden: false,
          },
        },
        {
          path: '/clash/rules',
          name: 'clash-rules',
          component: () => import('@/views/clash/Rules.vue'),
          meta: {
            title: '规则管理',
            icon: 'Memo',
            hidden: false,
          },
        },
        {
          path: '/clash/groups',
          name: 'clash-groups',
          component: () => import('@/views/clash/Groups.vue'),
          meta: {
            title: '分组管理',
            icon: 'Folder',
            hidden: false,
          },
        },
        {
          path: '/clash/proxies',
          name: 'clash-proxies',
          component: () => import('@/views/clash/Proxies.vue'),
          meta: {
            title: '代理节点',
            icon: 'User',
            hidden: false,
          },
        },
        {
          path: '/clash/logs',
          name: 'clash-logs',
          component: () => import('@/views/clash/Logs.vue'),
          meta: {
            title: '运行日志',
            icon: 'Log',
            hidden: true,
          },
        },
        {
          path: '/subscription/list',
          name: 'sub-list',
          component: () => import('@/views/subscription/List.vue'),
          meta: {
            title: '订阅列表',
            icon: 'List',
            hidden: false,
          },
        },
        {
          path: '/about',
          name: 'about',
          component: () => import('@/views/About.vue'),
          meta: {
            title: '关于系统',
            icon: 'InfoFilled',
            hidden: false,
          },
        },
      ],
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
    },
  ],
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.path === '/login' && token) {
    next({ path: '/' })
  } else if (to.path !== '/login' && !token) {
    next({ path: '/login' })
  } else {
    next()
  }
})

export default router
