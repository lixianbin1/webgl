import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
        path: '/',
        name: 'home',
        component: () => import('../view/index.vue')
      },
    {
      path: '/min_map',
      name: 'minMap',
      component: () => import('../example/min_map.vue')
    },
    // 404 页面配置必须放在最后
    {
      path: '/:pathMatch(.*)*',
      name: '404',
      component: () => import('../404.vue'),
      meta: {}
    }
  ]
})

export default router
