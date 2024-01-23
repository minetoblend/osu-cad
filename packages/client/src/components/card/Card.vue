<template>
  <div class="card">
    <slot></slot>
  </div>
</template>

<style lang="scss" scoped>
.card {
  background-color: $surface-50;
  border-radius: 8px;
  overflow: hidden;
}
</style>