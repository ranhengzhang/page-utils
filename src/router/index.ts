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
    {
      path: '/tools/img-to-markdown',
      name: 'img-to-markdown',
      component: () => import('../views/tools/ImgToMarkdown.vue'),
    },
    {
      path: '/tools/regex-extractor',
      name: 'regex-extractor',
      component: () => import('../views/tools/RegexExtractor.vue'),
    },
  ],
})

export default router
