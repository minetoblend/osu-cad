<script setup lang="ts">
defineProps<{
  label?: string;
  fullWidth?: boolean;
}>();
</script>

<template>
  <div class="row min-h-10 items-center">
    <label class="col-4">{{ label }}</label>
    <div :class="fullWidth ? 'col-8' : 'col-4'">
      <slot />
    </div>
  </div>
</template>

<style lang="scss">
.form-field {
  align-items: center;
  min-height: 40px;

  label {
    text-align: right;
    padding-right: 1rem;
  }

  .form-control {
    > .p-inputswitch {
      margin-bottom: -7px;
    }
  }
}
</style>
