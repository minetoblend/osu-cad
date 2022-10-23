<template>
  <div class="hitobject-timeline">
    <div ref="canvasContainer" class="timeline-canvas-container">
      <canvas ref="canvas">

      </canvas>
    </div>
  </div>
</template>

<script setup lang="ts">

import {useContext} from "@/editor";
import {onBeforeUnmount, onMounted, ref, watchEffect, WatchStopHandle} from "vue";
import {generateTicks, TimingTickType} from "@/editor/state/timing";

const ctx = useContext()
const canvas = ref<HTMLCanvasElement>()
const canvasContainer = ref<HTMLDivElement>()
let drawingContext: CanvasRenderingContext2D
let stopRender: WatchStopHandle

const resizeObserver = new ResizeObserver(entries => {
  canvas.value!.width = Math.floor(entries[0].contentRect.width)
  canvas.value!.height = Math.floor(entries[0].contentRect.height)
  render()
})

function render() {
  const g = drawingContext
  const width = canvas.value!.width
  const height = canvas.value!.height

  g.clearRect(0, 0, width, height)
  g.lineCap = "round"

  const visibleDuration = 4000
  const currentTime = ctx.clock.animatedTime
  const startTime = currentTime - visibleDuration / 2
  const endTime = currentTime + visibleDuration / 2

  const ticks = [
    ...generateTicks(ctx.beatmap.timing.uninheritedTimingPoints, startTime, endTime, 4)
  ]


  function timeToPx(time: number) {
    return (time - startTime) / visibleDuration * width
  }

  ticks.forEach(tick => {
    const x = timeToPx(tick.time)
    let h = height / 2

    switch (tick.type) {
      case TimingTickType.Full:
        g.strokeStyle = 'white'
        g.lineWidth = 2
        break;
      case TimingTickType.Half:
        g.strokeStyle = 'red'
        g.lineWidth = 1.5
        h = height * 0.25
        break;
      case TimingTickType.Third:
        g.strokeStyle = 'white'
        g.lineWidth = 1.5
        h = height * 0.25
        break;
      case TimingTickType.Quarter:
        g.strokeStyle = 'blue'
        g.lineWidth = 1
        h = height * 0.25
        break;
      default:
        return;
    }

    g.beginPath()
    g.moveTo(x, 0)
    g.lineTo(x, h)
    g.stroke()
  })

  const hitObjects =
      ctx.beatmap.hitobjects.getHitObjectsInRange(currentTime, visibleDuration / 2 + 1000, visibleDuration / 2 + 1000)

  hitObjects.reverse()

  hitObjects.forEach(it => {
    const duration = it.overriddenDuration

    g.strokeStyle = '#ffffff'
    g.fillStyle = '#05ff7d'
    g.lineWidth = 10

    const x = timeToPx(it.overriddenTime) - g.lineWidth / 2
    const radius = Math.max((height / 2) - 10, 1)

    if (duration === 0) {
      g.beginPath()
      g.arc(x, height / 2, radius, 0, 2 * Math.PI)
      g.stroke()
      g.fill()
    } else {
      const w = (duration / visibleDuration) * width

      g.beginPath()
      g.arc(x, height / 2, radius, Math.PI * 0.5, Math.PI * 1.5)
      g.arc(x + w, height / 2, radius, Math.PI * 1.5, Math.PI * 0.5)
      g.lineTo(x, height / 2 + radius)
      g.stroke()
      g.fill()
    }
  })

  g.strokeStyle = 'yellow'
  g.lineWidth = 3
  g.beginPath()
  g.moveTo(width / 2, 0)
  g.lineTo(width / 2, height)
  g.stroke()
}

onMounted(() => {
  drawingContext = canvas.value!.getContext('2d')!
  resizeObserver.observe(canvasContainer.value!)
  watchEffect(() => render())
})

onBeforeUnmount(() => resizeObserver.disconnect())
</script>

<style lang="scss">

.hitobject-timeline {
  box-sizing: border-box;
  padding: 5px;
  display: flex;
  width: 100%;
  align-items: center;
  height: 64px;
  gap: 12px;
  user-select: none;

  .timeline-canvas-container {
    flex-grow: 1;
    background-color: rgba(0, 0, 0, 0.8);
    border-radius: 4px;
    height: 64px;
  }
}

</style>