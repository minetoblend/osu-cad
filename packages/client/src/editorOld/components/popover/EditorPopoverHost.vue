<script setup lang="ts">
import { usePixiPopover } from './index.ts';

const { currentPopover, hidePopover } = usePixiPopover();

const popoverRef = ref<HTMLDivElement>();

useEventListener('pointerdown', (evt) => {
  if (!popoverRef.value) return;
  if (
    evt.target === popoverRef.value ||
    evt.composedPath().includes(popoverRef.value)
  )
    return;
  nextTick(() => {
    if (!evt.defaultPrevented) hidePopover();
  });
});
</script>

<template>
  <div class="popover-host">
    <transition :duration="200">
      <div
        v-if="currentPopover"
        class="popover"
        :style="{
          top: currentPopover.position.y + 'px',
          left: currentPopover.position.x + 'px',
        }"
      >
        <div
          ref="popoverRef"
          class="popover-content"
          :class="currentPopover.anchor"
        >
          <component
            :is="currentPopover.component"
            v-bind="currentPopover.props"
            :key="currentPopover.id"
            :popover="currentPopover"
          />
        </div>
      </div>
    </transition>
  </div>
</template>

<style lang="scss">
.popover-host {
  position: absolute;
  top: 0;
  left: 0;

  .popover {
    position: absolute;
    z-index: 100;

    .popover-content {
      position: absolute;
      z-index: 100;
      overscroll-behavior: contain;

      &.top {
        bottom: 100%;
      }

      &.bottom {
        top: 100%;
      }

      &.left {
        right: 100%;
      }

      &.right {
        left: 100%;
      }
    }

    &.v-enter-active,
    &.v-leave-active {
      transition: all 0.2s cubic-bezier(0.06, 0.69, 0.43, 1.22);
    }

    &.v-enter-from,
    &.v-leave-to {
      opacity: 0;
      transform: scale(0.8, 0.5);
    }
  }
}
</style>
