<template>
  <div ref="canvasWrapper" class="canvas-wrapper">

  </div>

</template>

<script lang="ts">
import {PIXI} from "@/pixi";
import {defineComponent, nextTick, onMounted, ref} from "vue";
import {EditorContext} from "@/objects/Editor";
import {HitCircle} from "@/objects/HitCircle";
import {Vec2} from "@/util/math";

export default defineComponent({
  props: [
    'context',
    'app'
  ],
  setup(props) {
    const app: PIXI.Application = props.app
    const context: EditorContext = props.context
    const canvasWrapper = ref<HTMLDivElement>()

    const playFieldWrapper = new PIXI.Container()

    const playField = context.drawablePool.playfield

    function setAppSize(width: number, height: number) {
      app.renderer.resize(width, height)

      const paddingX = 50
      const paddingY = 50

      const scaleX = width / (512 + paddingX * 2)
      const scaleY = height / (384 + paddingY * 2)
      const scaleFactor = Math.min(
          scaleX,
          scaleY,
      )

      playFieldWrapper.scale.set(scaleFactor)

      const x = (width - (512 + paddingX * 2) * scaleFactor) / 2
      const y = (height - (384 + paddingY * 2) * scaleFactor) / 2

      playFieldWrapper.position.set(x, y)
      playField.position.set(paddingX, paddingY)
    }

    onMounted(() => {
      canvasWrapper.value!.appendChild(app.view)
      app.stage.addChild(playFieldWrapper)
      playFieldWrapper.addChild(context.drawablePool.playfield)

      setAppSize(canvasWrapper.value!.scrollWidth, canvasWrapper.value!.scrollHeight)

      nextTick(() => {


      })
    })

    return {
      canvasWrapper
    }
  }
})
</script>

<style lang="scss">
.canvas-wrapper {
  width: 100%;
  height: 100%;
  background: lightblue;
}
</style>