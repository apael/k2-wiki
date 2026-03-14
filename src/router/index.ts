import { createRouter, createWebHistory } from 'vue-router'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'beastiary',
      component: () => import('../views/BeastiaryView.vue'),
    },
    {
      path: '/items',
      name: 'items',
      component: () => import('../views/ItemsView.vue'),
    },
    {
      path: '/expeditions',
      name: 'expeditions',
      component: () => import('../views/ExpeditionsView.vue'),
    },
  ],
})
