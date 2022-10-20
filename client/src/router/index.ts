import {createRouter, createWebHistory, RouteRecordRaw} from 'vue-router'
import HomeView from '../views/HomeView.vue'
import EditorView from '../views/EditorView.vue'
import LoggedInView from '../views/LoggedInView.vue'

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        name: 'home',
        component: HomeView
    },
    {
        path: '/logged-in',
        name: 'loggedIn',
        component: LoggedInView
    },
    {
        path: '/edit/:id',
        name: 'editor',
        component: EditorView,
    },
    {
        path: '/test',
        name: 'test',
        component: () => import('@/views/TestView.vue')
    }
]

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
})

export default router
