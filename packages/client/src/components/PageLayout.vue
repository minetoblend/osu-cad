<template>
  <div class="page-layout">
    <div v-if="$slots.left || $slots.right" class="sidebar left">
      <slot name="left" />
    </div>
    <div class="page-content">
      <slot />
    </div>
    <div v-if="$slots.left || $slots.right" class="sidebar right">
      <slot name="right" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.page-layout {
  display: flex;
  justify-content: center;

  .page-content {
    width: 100%;
    max-width: 960px;
  }

  .sidebar {
    width: 200px;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: stretch;

    &.left {
      margin-right: 2rem;
    }

    &.right {
      margin-left: 2rem;
    }
  }
}
</style>
