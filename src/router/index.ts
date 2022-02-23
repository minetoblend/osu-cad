import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Home from '../views/Home.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/edit/:id',
    name: 'Edit',
    component: () => import(/* webpackChunkName: "editor" */ '../views/Edit.vue')
  },
  {
    path: '/unauthorized',
    name: 'Unauthorized',
    component: () => import(/* webpackChunkName: "unauthorized" */ '../views/Unauthorized.vue')
  },
  {
    path: '/authenticated',
    name: 'Authenticated',
    redirect: (to)=> {
      const redirectTo = localStorage.getItem('redirectAfterAuthorize')
      if(redirectTo) {
        localStorage.removeItem('redirectAfterAuthorize')
        return redirectTo
      }
      return '/'
    }
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
