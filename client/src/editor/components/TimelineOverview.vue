<template>
  <div class="timeline-overview">
    <div class="controls">
      <div class="current-time">
        {{ formatTimestamp(ctx.clock.time) }}
      </div>
      <n-button @click="ctx.clock.togglePlaying()">
        <n-icon>
          <Play v-if="!ctx.clock.isPlaying"/>
          <Pause v-else/>
        </n-icon>
      </n-button>
    </div>
    <div ref="canvasContainer" class="overview-canvas-container" @mousedown="handleSeek">
      <canvas ref="canvas">

      </canvas>
    </div>

    <div class="controls">
      <n-button class="playbackrate-button" @click="cyclePlaybackRates">
        Playback Rate ({{ ctx.clock.playbackRate * 100 }}%)
      </n-button>
    </div>
  </div>
</template>

<script setup lang="ts">

import {useContext} from "@/editor";
import {formatTimestamp} from "@/util/time";
import {onBeforeUnmount, onMounted, ref, watchEffect, WatchStopHandle} from "vue";
import {drag} from "@/util/drag";
import {Pause, Play} from '@vicons/fa'

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

const padX = 12


function render() {
  const g = drawingContext
  const width = canvas.value!.width
  const height = canvas.value!.height

  g.imageSmoothingEnabled = false

  function timeToPx(time: number) {
    return padX + (width - padX * 2) * time / ctx.clock.duration
  }

  function drawTime(time: number, own: boolean, color?: string) {

    if (own) {
      g.strokeStyle = 'white'
      g.lineCap = "round"
      g.lineWidth = 3

    } else {
      g.strokeStyle = color ?? 'rgba(5, 255, 125, 0.7)'
      g.lineCap = "round"
      g.lineWidth = 3
    }

    const x = timeToPx(time)
    g.beginPath()
    g.moveTo(x, 3)
    g.lineTo(x, height - 3)
    g.stroke()
  }

  g.clearRect(0, 0, width, height)

  g.lineCap = "round"
  g.lineWidth = 1

  ctx.state.beatmap.timing.timingPoints.forEach(it => {
    const x = timeToPx(it.time)
    if (it.isInherited)
      g.strokeStyle = '#05ff7d'
    else
      g.strokeStyle = '#ff4405'

    g.beginPath()
    g.moveTo(x, 6)
    g.lineTo(x, height - 6)
    g.stroke()
  })

  ctx.state.user.users.value.forEach(userData => {
    if (userData.sessionId === ctx.state.user.sessionId)
      return
    drawTime(userData.currentTime, false, userData.color.rgb)
  })

  drawTime(ctx.clock.animatedTime, true)
}


function handleSeek(evt: MouseEvent) {
  drag(evt, {
    el: canvasContainer.value,
    onDrag({current}) {
      const width = canvasContainer.value!.clientWidth
      const time = Math.floor(
          (current.x - padX) / (width - padX * 2) * ctx.clock.duration
      )
      ctx.clock.seek(time)
    },
    onMouseDown({current}) {
      const width = canvasContainer.value!.clientWidth
      const time = Math.floor(
          (current.x - padX) / (width - padX * 2) * ctx.clock.duration
      )
      ctx.clock.seek(time)
    }
  })
}

onMounted(() => {
  drawingContext = canvas.value!.getContext('2d')!
  resizeObserver.observe(canvasContainer.value!)
  watchEffect(() => render())
})

onBeforeUnmount(() => resizeObserver.disconnect())

let currentPlaybackRateIndex = 0
const playbackRates = [1, 0.5, 0.25]

function cyclePlaybackRates() {
  ctx.clock.playbackRate = playbackRates[(++currentPlaybackRateIndex) % playbackRates.length]
}


</script>

<style lang="scss">

.timeline-overview {
  box-sizing: border-box;
  padding: 5px;
  display: flex;
  width: 100%;
  align-items: center;
  gap: 12px;

  .controls {
    font-size: 1.3rem;
    display: flex;
    gap: 10px;

    .current-time {
      font-variant-numeric: tabular-nums;
    }
  }

  .overview-canvas-container {
    flex-grow: 1;
    background-color: rgba(0, 0, 0, 0.8);
    border-radius: 4px;
    height: 32px;
  }

  .playbackrate-button {
    width: 170px;
  }

}

</style>