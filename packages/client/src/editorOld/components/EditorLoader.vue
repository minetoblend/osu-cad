<script setup lang="ts">
import { AppHost } from '@/framework/AppHost.ts';
import { EditorLoader } from '@/editor/EditorLoader.ts';
import { createSocket } from '@/editor/EditorSocket.ts';

import fontUrl from '@fontsource/nunito-sans/files/nunito-sans-latin-400-normal.woff2';
import fontUrlSemibold from '@fontsource/nunito-sans/files/nunito-sans-latin-600-normal.woff2';
import fontUrlBold from '@fontsource/nunito-sans/files/nunito-sans-latin-700-normal.woff2';
import { Assets } from 'pixi.js';
import { DebugOverlay } from '@/framework/debug/DebugOverlay.ts';

const props = defineProps<{
  joinKey: string;
}>();

const container = ref<HTMLDivElement>();
const host = new AppHost();

onMounted(async () => {
  await Promise.all(
    [400, 500, 600, 700].map((weight) =>
      Assets.load(`/assets/fonts/nunito-sans-latin-${weight}-normal.fnt`),
    ),
  );

  await host.init();

  const socket = createSocket(props.joinKey);

  host.stage.add(new EditorLoader(socket));

  container.value?.appendChild(host.canvas);

  let debugOverlay: DebugOverlay | null = null;
  document.addEventListener('keydown', (e) => {
    if (e.key === 'F1') {
      if (!debugOverlay) {
        debugOverlay = new DebugOverlay(host.stage);
        host.stage.drawNode.addChild(debugOverlay);
      } else {
        host.stage.drawNode.removeChild(debugOverlay);
        debugOverlay = null;
      }
      e.preventDefault();
    }
  });
});

onBeforeUnmount(() => {
  host.destroy();
});
</script>

<template>
  <div ref="container" />
</template>
