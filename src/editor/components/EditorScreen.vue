<template>
  <div class="editor-screen">
    <slot></slot>
  </div>
</template>

<style lang="scss">
.editor-screen {
  position: absolute;
  inset: 0;
  overflow: hidden;

  &-enter-active,
  &-leave-active {
    $duration: 0.13s;

    transition: transform $duration ease-out, opacity $duration linear;
  }

  &-enter-from {
    transform: scale(0.95);
    opacity: 0;
  }

  &-leave-to {
    opacity: 0;
    //transform: scale(1.05);
  }
}
</style>
