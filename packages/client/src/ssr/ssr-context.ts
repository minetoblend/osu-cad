import 'pinia';
import '@vue/server-renderer';
import { getActivePinia } from 'pinia';
import { SSRContext } from '@vue/server-renderer';

declare module 'pinia' {
  interface Pinia {
    ssrContext?: SSRContext & {
      cookie?: string;
    };
  }
}

export function ssrContext(): SSRContext | undefined {
  return getActivePinia()?.ssrContext;
}
