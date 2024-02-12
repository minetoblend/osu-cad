<template>
  <div class="oc-btn-group">
    <slot>
    </slot>
  </div>
</template>

<style lang="scss">
.oc-btn-group {
  display: flex;

  >.oc-btn {
    &:not(:last-child) {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }

    &:not(:first-child) {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
      border-left-width: 0;
    }


  }
}


</style>