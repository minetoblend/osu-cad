<script setup lang="ts">
import { Application, Ticker } from 'pixi.js';
import '../drawables/DrawableSystem.ts';
import { EditorViewportDrawable } from '../drawables/EditorViewportDrawable.ts';
import gsap from 'gsap';
import { usePreferences } from '@/composables/usePreferences.ts';
import { useEditor } from '@/editor/editorContext.ts';
import { isMobile } from '@/utils';

//RenderTarget.defaultDescriptor.depth = true;

const app = new Application();

const viewportContainer = ref<HTMLElement>();

const { width, height } = useElementSize(viewportContainer);

const editor = useEditor();

const emit = defineEmits(['initialized']);

const viewportSize = reactive({
  width: 0,
  height: 0,
});

const { preferences } = usePreferences();

let lastRender = performance.now();

onMounted(async () => {
  const resolution = 1;

  let antialias = preferences.graphics.antialiasing;
  if (isMobile()) {
    antialias = false;
  }

  const canvas = document.createElement('canvas');

  const context = canvas.getContext('webgl2', {
    antialias,
    powerPreference: 'high-performance',
    depth: true,
    alpha: false,
    stencil: true,
    premultipliedAlpha: false,
    preserveDrawingBuffer: true,
    failIfMajorPerformanceCaveat: false,
    desynchronized: true,
  });

  await app.init({
    canvas,
    context,
    resizeTo: viewportContainer.value!,
    preference: 'webgl',
    sharedTicker: true,
    resolution: preferences.graphics.highDpiMode
      ? window.devicePixelRatio
      : 1.0,
    autoDensity: true,
    useBackBuffer: true,
    depth: true,
    webgpu: {
      antialias,
      powerPreference: 'high-performance',
      clearBeforeRender: true,
    },
    webgl: {
      antialias,
      powerPreference: 'high-performance',
      clearBeforeRender: true,
      preferWebGLVersion: 2,
    },
    eventFeatures: {},
  });

  console.log('app', app);

  viewportContainer.value!.prepend(app.canvas);

  viewportSize.width = width.value;
  viewportSize.height = height.value;

  const viewportDrawable = new EditorViewportDrawable(viewportSize, editor);

  app.stage.addChild(viewportDrawable);

  // app.renderer.events.setTargetElement(
  //     document.getElementById("event-receiver")!,
  // )

  app.render();

  requestAnimationFrame(() => {
    emit('initialized');
  });

  addEventListener('pointermove', () => {
    const now = performance.now();
    // boost up to 200 fps
    if (now - lastRender > 5) {
      app.render();
      lastRender = now;
    }
  });

  Ticker.shared.add(() => {
    lastRender = performance.now();
  });

  watch([width, height], ([width, height]) => {
    gsap.to(viewportSize, {
      width: width * resolution,
      height: height * resolution,
      duration: 0.5,
      ease: 'power4.out',
    });
  });
});

watchEffect(() => {
  const resolution = preferences.graphics.resolution;
  if (app.renderer) {
    app.renderer.resize(
      viewportSize.width,
      viewportSize.height,
      0.25 + (devicePixelRatio - 0.25) * resolution,
    );
  }
});

onBeforeUnmount(() => {
  app.destroy();
});
</script>
<template>
  <div ref="viewportContainer" class="viewport-container" @contextmenu.prevent>
    <div id="event-receiver" />
  </div>
</template>

<style lang="scss" scoped>
.viewport-container {
  cursor:
    url('@/assets/icons/cursor.svg') 5 2,
    auto;
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
