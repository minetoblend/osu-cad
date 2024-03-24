import { Awaitable, MultiWatchSources } from '@vueuse/core';
import { usePageData } from '@/stores/pageDataStore.ts';
import { Ref, WatchSource } from 'vue';
import { sanitizeError } from '@/ssr/sanitizeError.ts';

export function useLoader<T>(
  key: string,
  load: () => Awaitable<T>,
  initialState: T,
  watchDeps?: WatchSource | MultiWatchSources,
): {
  data: Ref<T>;
  isLoading: Ref<boolean>;
  error: Ref<unknown | undefined>;
};

export function useLoader<T = any>(
  key: string,
  load: () => Awaitable<T>,
  initialState?: undefined,
  watchDeps?: WatchSource | MultiWatchSources,
): {
  data: Ref<T | undefined>;
  isLoading: Ref<boolean>;
  error: Ref<unknown | undefined>;
};

export function useLoader<T>(
  key: string,
  load: () => Awaitable<T>,
  initialState?: T,
  watchDeps?: WatchSource | MultiWatchSources,
) {
  const { data: pageData } = usePageData();

  if (import.meta.env.SSR) {
    const state = shallowReactive({
      value: initialState as T,
      error: null as unknown,
    });

    onServerPrefetch(async () => {
      try {
        state.value = await load();
      } catch (e) {
        state.value = initialState as T;
        state.error = sanitizeError(e);
      }
      pageData[key] = state;
    });

    return {
      data: toRef(state, 'value'),
      error: toRef(state, 'error'),
      isLoading: ref(false),
    };
  } else {
    const data = ref(initialState);
    const error = ref<unknown>();
    const usePageData = ref(false);
    if (key in pageData) {
      const value = pageData[key];
      delete pageData[key];
      data.value = value.value;
      error.value = value.error;
      usePageData.value = true;
    }

    const asyncState = useAsyncState(async () => load(), initialState, {
      immediate: !usePageData.value,
      shallow: false,
    });

    if (watchDeps) {
      watch(watchDeps, () => {
        usePageData.value = false;
        asyncState.execute();
      });
    }

    return {
      data: computed(() =>
        usePageData.value ? data.value : asyncState.state.value,
      ),
      error: computed(() =>
        usePageData.value ? error.value : asyncState.state.value,
      ),
      isLoading: asyncState.isLoading,
    };
  }
}
