<script setup lang="ts">
import {Application} from "pixi.js";
import "../drawables/DrawableSystem.ts";
import {EditorViewportDrawable} from "../drawables/EditorViewportDrawable.ts";
import gsap from "gsap";
import {usePreferences} from "@/composables/usePreferences.ts";
import {useEditor} from "@/editor/editorContext.ts";
import {isMobile} from "@/util/isMobile.ts";

const app = new Application();

const viewportContainer = ref<HTMLElement>();

const {width, height} = useElementSize(viewportContainer);

const editor = useEditor();

const emit = defineEmits(['initialized']);

const viewportSize = reactive({
  width: 0,
  height: 0,
});

const {preferences} = usePreferences();

onMounted(async () => {
  const resolution = 1;

  let antialias = preferences.graphics.antialiasing
  if (isMobile()) {
    antialias = false;
  }

  await app.init({
    resizeTo: viewportContainer.value!,
    preference: 'webgl',
    sharedTicker: true,
    resolution: preferences.graphics.highDpiMode ? window.devicePixelRatio : 1.0,
    autoDensity: preferences.graphics.highDpiMode,
    preferWebGLVersion: 2,
    useBackBuffer: true,
    webgpu: {
      antialias,
      powerPreference: "high-performance",
      clearBeforeRender: true,
    },
    webgl: {
      antialias,
      powerPreference: "high-performance",
      clearBeforeRender: true,
      preferWebGLVersion: 2,
    },
  });

  console.log("app", app);

  app.renderer.view.texture.source.on("resize", () => {
    console.log("resize");
  });

  viewportContainer.value!.appendChild(app.canvas);

  viewportSize.width = width.value;
  viewportSize.height = height.value;

  const viewportDrawable = new EditorViewportDrawable(
      viewportSize,
      editor,
  );

  app.stage.addChild(viewportDrawable);

  app.render()

  requestAnimationFrame(() => {
    emit('initialized');
  })

  watch([width, height], ([width, height]) => {
    gsap.to(viewportSize, {
      width: width * resolution,
      height: height * resolution,
      duration: 0.5,
      ease: "power4.out",
    });
  });
});

watchEffect(() => {
  const resolution = preferences.graphics.resolution;
  if (app.renderer) {
    app.renderer.resize(
        viewportSize.width,
        viewportSize.height,
        0.25 + (devicePixelRatio - 0.25) * resolution
    );
  }
})

onBeforeUnmount(() => {
  app.destroy();
});


</script>
<template>
  <div class="viewport-container" ref="viewportContainer" @contextmenu.prevent/>
</template>

<style lang="scss" scoped>
.viewport-container {
  cursor: url("@/assets/icons/cursor.svg") 5 2, auto;
}
</style>