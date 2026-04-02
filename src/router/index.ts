import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/tools/bili-check',
      name: 'bili-check',
      component: () => import('../views/tools/BiliCheck.vue'),
    },
  ],
})

export default router
