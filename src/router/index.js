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
      path: '/ManageSQL',
      name: 'ManageSQL',
      component: () => import('@/view/ManageSQL/index.vue')
    },
    {
      path: '/Word',
      name: 'Word',
      component: () => import('@/view/Word/index.vue')
    },
    {
      path: '/min_map',
      name: 'minMap',
      component: () => import('../example/min_map.vue')
    },
    {
      path: '/min_map_plug',
      name: 'minMapPlug',
      component: () => import('../example/min_map_plug.vue')
    },
    {
      path: '/min_word',
      name: 'minWord',
      component: () => import('../example/min_word.vue')
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
