import { createApp } from '@/main.ts';
import axios from 'axios';
import { useUserStore } from '@/stores/userStore.ts';
import { renderToString, SSRContext } from '@vue/server-renderer';
import { renderPreloadLinks } from '@/ssr/render-preload-links.ts';
import { renderInitialState } from '@/ssr/render-initial-state.ts';
import { withActivePinia } from '@/ssr/withActivePinia.ts';

axios.defaults.baseURL =
  import.meta.env.VITE_SSR_API_BASEURL ?? 'http://localhost:3000';

export async function render(
  url: string,
  manifest: Record<string, string[]>,
  cookie?: string,
) {
  const { app, router, pinia, head } = createApp();

  const ctx: SSRContext = { cookie };

  pinia.ssrContext = ctx;

  await withActivePinia(pinia, () => useUserStore(pinia).loadUser());
  await router.push(url);
  await router.isReady();

  const html = await renderToString(app, ctx);

  const preloadLinks = renderPreloadLinks(ctx.modules, manifest);

  const initialState = renderInitialState({
    pinia: pinia.state.value,
  });

  return { html, head, preloadLinks, initialState };
}
