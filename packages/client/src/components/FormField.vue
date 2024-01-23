<script setup lang="ts">
defineProps<{
  label?: string
  fullWidth?: boolean
}>();
</script>

<template>
  <div class="form-field grid">
    <label class="col-4">{{ label }}</label>
    <div class="form-control" :class="{ ['col-' + fullWidth ? 8 : 4]: true }">
      <slot/>
    </div>
  </div>
</template>

<style lang="scss">
.form-field {
  align-items: center;

  label {
    text-align: right;
  }

  .form-control {
    > .p-inputswitch {
      margin-bottom: -7px;
    }
  }
}
</style>