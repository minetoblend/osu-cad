import { defineStore } from 'pinia';
import { UserInfo } from '@osucad/common';
import { useAxios } from '@/composables/useAxios.ts';
import { ssrContext } from '@/ssr/ssr-context.ts';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null as UserInfo | null,
    loaded: false,
  }),
  getters: {
    isLoggedIn(): boolean {
      return !!this.user;
    },
    isAdmin(): boolean {
      return !!this.user?.isAdmin;
    },
  },
  actions: {
    async loadUser() {
      if (this.user) {
        // Sentry.setUser({
        //   id: this.user.id,
        //   username: this.user.username,
        // });
        return;
      }

      if (import.meta.env.SSR) {
        if (!ssrContext()?.cookie) {
          this.loaded = true;
          return;
        }
      }

      try {
        const response = await useAxios().get<UserInfo>('/api/users/me', {
          withCredentials: true,
          validateStatus(status) {
            return status < 500;
          },
        });

        if (response.data && response.status < 400) {
          this.user = response.data;
          // Sentry.setUser({
          //   id: response.data.id,
          //   username: response.data.username,
          // });
        }
      } catch (e) {
        // cookie is invalid, we ignore
      }
      this.loaded = true;
    },
    login(redirect: string = window.location.pathname) {
      window.location.href = `/auth/login?redirect=${redirect}`;
    },
    logout() {
      this.user = null;
      window.location.href = '/auth/logout';
    },
  },
});
