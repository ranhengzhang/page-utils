import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import { tools } from '../config/tools';

const toolRoutes = tools.map((tool) => ({
  path: tool.path,
  name: tool.id,
  component: tool.component,
}));

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    ...toolRoutes,
  ],
});

export default router;
