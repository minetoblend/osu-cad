import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Home from '../views/Home.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/edit',
    name: 'Edit',
    component: () => import(/* webpackChunkName: "editor" */ '../views/Edit.vue')
  },
  {
    path: '/unauthorized',
    name: 'Unauthorized',
    component: () => import(/* webpackChunkName: "unauthorized" */ '../views/Unauthorized.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
