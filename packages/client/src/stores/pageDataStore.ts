import { defineStore } from 'pinia';

export const usePageData = defineStore('pageData', {
  state: () => ({ data: {} as Record<string, any> }),
});
