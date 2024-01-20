<script setup lang="ts">
import {Application, Assets} from "pixi.js";
import "../drawables/DrawableSystem.ts";
import {EditorViewportDrawable} from "../drawables/EditorViewportDrawable.ts";
import {useEditor} from "../editorClient.ts";
import gsap from "gsap";

const app = new Application();

const viewportContainer = ref<HTMLElement>();

const { width, height } = useElementSize(viewportContainer);

const editor = useEditor();

const viewportSize = reactive({
  width: 0,
  height: 0,
});

onMounted(async () => {

  const resolution = 1;
  await app.init({
    resizeTo: viewportContainer.value!,
    preference: "webgl",
    sharedTicker: true,
    resolution: window.devicePixelRatio,
    autoDensity: true,
    preferWebGLVersion: 2,
    webgpu: {
      antialias: true,
      powerPreference: "high-performance",
      clearBeforeRender: true,
    },
    webgl: {
      antialias: true,
      powerPreference: "high-performance",
      clearBeforeRender: true,
      preferWebGLVersion: 2,
    },
  });

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


  watch([width, height], ([width, height]) => {
    gsap.to(viewportSize, {
      width: width * resolution,
      height: height * resolution,
      duration: 0.5,
      ease: "power4.out",
    });
  });


  console.log(app);
});

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