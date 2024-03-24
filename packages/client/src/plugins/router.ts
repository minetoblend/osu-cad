import {
  createMemoryHistory,
  createRouter as _createRouter,
  createWebHistory,
} from 'vue-router';
import { routes } from 'vue-router/auto/routes';
import { useUserStore } from '@/stores/userStore.ts';

export function createRouter() {
  const router = _createRouter({
    history: import.meta.env.SSR ? createMemoryHistory() : createWebHistory(),
    routes,
  });

  router.beforeEach(async (to, _from, next) => {
    const userStore = useUserStore();

    if (to.meta.requiresAdmin) {
      if (!userStore.loaded) {
        await userStore.loadUser();
      }

      if (!userStore.user?.isAdmin) {
        next('/404');
        return;
      }
    }

    if (to.meta.requiresAuth && !userStore.isLoggedIn) {
      if (!userStore.loaded) {
        await userStore.loadUser();
      }

      if (!userStore.isLoggedIn && to.meta.authRedirect) {
        next(to.meta.authRedirect);
        return;
      }
    }
    next();
  });

  return router;
}

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean;
    requiresAdmin?: boolean;
    authRedirect?: import('vue-router/auto').RouteLocationRaw;
  }
}
