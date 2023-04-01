import {createRouter, createWebHistory, RouteRecordRaw} from "vue-router";

import HomeView from "../views/HomeView.vue";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: HomeView,
  },
  {
    path: "/editor/:id",
    component: () => import("../views/EditorView.vue"),
  },
  {
    path: "/authenticated",
    component: () => import("../views/AuthenticatedView.vue"),
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
