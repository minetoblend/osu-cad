<template>
  <div ref="el" class="knob" :class="{active: isDragging, inactive}">
    <svg viewbox="0 0 32 32" width="32" height="32">
      <path class="knob-arc" :d="path" fill="none" :stroke="color" stroke-linecap="round" stroke-width="2"/>
      <circle class="knob-circle" cx="16" cy="16" r="8"></circle>
    </svg>

    <transition name="knob-value">
      <div class="knob-value" v-if="showValue">
        <div class="value">
          {{ (modelValue * 100).toFixed() }}%
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">

import {computed, reactive, ref} from "vue";
import {debouncedRef, refAutoReset, useDraggable, useEventListener, useVModel} from "@vueuse/core";

const props = withDefaults(defineProps<{
  modelValue: number
  min?: number
  max?: number
  color?: string
  inactive?: boolean
}>(), {
  min: 0,
  max: 1,
  color: '#63E2B7'
})

const el = ref<HTMLDivElement>()

const modelValue = useVModel(props, 'modelValue')

function remap(value: number, min1: number, max1: number, min2: number, max2: number) {
  return min2 + (max2 - min2) * ((value - min1) / (max1 - min1));
}

const showValue = refAutoReset(false, 500)

const startPosition = reactive({x: 0, y: 0})

const {isDragging} = useDraggable(el, {
  onMove: (_, evt) => {
    let value = modelValue.value - (evt.movementY / 200)
    value = Math.min(props.max, Math.max(props.min, value))
    modelValue.value = value

    showValue.value = true
  }
})

useEventListener(el, 'wheel', (evt: WheelEvent) => {
  evt.preventDefault()

  showValue.value = true

  const delta = -Math.sign(evt.deltaY) * 0.05

  modelValue.value = Math.min(Math.max(modelValue.value + delta, props.min), props.max)
})

const path = computed(() => {
  const relative = (props.modelValue - props.min) / (props.max - props.min)
  const startAngle = Math.PI * 1.25
  const endAngle = Math.PI * -0.25 + Math.PI * 1.5 * (1 - relative)
  return createSvgArc(16, 16, 12, startAngle, endAngle)
})

function createSvgArc(x: number, y: number, r: number, startAngle: number, endAngle: number) {
  if (startAngle > endAngle) {
    const s = startAngle;
    startAngle = endAngle;
    endAngle = s;
  }
  if (endAngle - startAngle > Math.PI * 2) {
    endAngle = Math.PI * 1.99999;
  }

  const largeArc = endAngle - startAngle <= Math.PI ? 0 : 1;

  return [
    "M",
    x + Math.cos(startAngle) * r,
    y - Math.sin(startAngle) * r,
    "A",
    r,
    r,
    0,
    largeArc,
    0,
    x + Math.cos(endAngle) * r,
    y - Math.sin(endAngle) * r,
  ].join(" ");
}


</script>?

<style lang="scss">
.knob {
  display: inline-block;
  width: 32px;
  height: 32px;
  position: relative;

  svg {
    cursor: pointer;
  }

  .knob-circle {
    fill: #454554;
    stroke: #202831;
  }

  &:hover, &.active {
    svg .knob-circle {
      fill: adjust-color(#454554, $lightness: -5%);
    }
  }

  &.inactive {
    .knob-arc {
      opacity: 0.5;
    }
  }

  .knob-value {
    position: absolute;
    left: 0;
    right: 0;
    top: 32px;
    display: flex;
    justify-content: center;
    text-align: center;
    min-width: 32px;

    .value {
      background-color: rgba(white, 0.1);
      width: fit-content;
      padding: 2px 8px;
      line-height: 1;
      border-radius: 4px;
    }

    &-enter-active, &-leave-active {
      transition: transform 0.12s ease-out, opacity 0.12s ease-out;
    }

    &-enter-from, &-leave-to {
      opacity: 0;
      transform: translateY(-4px);
    }
  }
}
</style>
