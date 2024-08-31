import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue')
    },
    {
      path: '/color-theory',
      name: 'color-theory',
      component: () => import('../views/ColorTheory.vue')
    },
    {
      path: '/color-sensitivity',
      name: 'color-sensitivity',
      component: () => import('../components/ColorSensitivityView.vue')
    },
    {
      path: '/color-model',
      name: 'color-model',
      component: () => import('../components/ColorModelView.vue')
    }
  ]
})

export default router
