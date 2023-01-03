<template>
  <editor-screen class="compose-screen">
    <div class="toolbar">
      {{ fps }}
    </div>
    <div ref="container" class="canvas-container"/>
    <div class="compose-timeline">
      <hit-object-timeline/>
    </div>
  </editor-screen>
</template>
<script setup lang="ts">
import EditorScreen from "@/editor/components/EditorScreen.vue";
import {usePixi} from "@/editor/components/compose/renderer";
import {reactive, ref, watchEffect} from "vue";
import {createPlayfieldBorder} from "@/editor/components/compose/drawable/playfield.border";
import {fixedResolutionContainer} from "@/editor/components/compose/drawable/container";
import {createPlayfieldGrid} from "@/editor/components/compose/drawable/playfield.grid";
import {Container, filters, Transform} from "pixi.js";
import {useZoom} from "@/use/useZoom";
import {createPlayfieldBackground} from "@/editor/components/compose/drawable/playfield.background";
import {createPlayfieldObjectsContainer} from "@/editor/components/compose/drawable/hitobjectContainer";
import {useEventListener, useFps, useMagicKeys, whenever} from "@vueuse/core";
import {useClock} from "@/editor/clock";
import HitObjectTimeline from "@/editor/components/HitObjectTimeline.vue";
import {useTools} from "@/editor/components/compose/tools";

const container = ref<HTMLDivElement>()

const {stage, width, height, renderer} = usePixi(container)


const {matrix} = fixedResolutionContainer({
  width: 512,
  height: 384,
  actualWidth: width,
  actualHeight: height,
  scale: 0.9
})

const fps = useFps()

const transform = reactive(new Transform()) as Transform

const {transform: zoom} = useZoom(container)

const playfieldContainer = new Container()

playfieldContainer.transform = transform

watchEffect(() => {
  transform.setFromMatrix(zoom.localTransform.clone().append(matrix.value))
})

stage.addChild(
    createPlayfieldBackground(transform),
    createPlayfieldBorder(transform),
    createPlayfieldGrid(transform),
    playfieldContainer,
)


const {container: toolContainer} = useTools(container)

playfieldContainer.addChild(
    createPlayfieldObjectsContainer(renderer, transform),
    toolContainer
)

stage.filters = [
  new filters.FXAAFilter()
]

const clock = useClock()

useEventListener('wheel', (e: WheelEvent) => {
  // e.preventDefault()
  if (!e.ctrlKey) {

    const delta = Math.sign(e.deltaY) * 100

    clock.seek(clock.currentTime.value + delta)
  }
})

const {Space} = useMagicKeys()

whenever(Space, () => {
  clock.playing.value = !clock.playing.value
})

</script>

<style lang="scss" scoped>

.compose-screen {
  display: grid;
  grid-template:
    'toolbar viewport'
    'timeline timeline';

  grid-template-columns: 48px auto;
  grid-template-rows: auto min-content;
  height: 100%;

  .toolbar {
    width: 48px;
    grid-area: toolbar;
    border-right: 1px solid #343440;
    box-sizing: border-box;
  }

  .canvas-container {
    grid-area: viewport;
    //position: relative;
    overflow: hidden;
  }

  .compose-timeline {
    grid-area: timeline;
    background-color: #1A1A20;
  }
}
</style>
