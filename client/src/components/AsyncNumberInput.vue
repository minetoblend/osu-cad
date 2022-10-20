<template>
  <n-input-number class="async-number-input"
                  v-model:value="localValue"
                  @blur="commit"
                  @keydown.enter="commit"
                  :loading="loading"
                  :show-button="false">
    <template #prefix>
      <span class="text-muted">
        {{ label }}
      </span>
    </template>
  </n-input-number>
</template>

<script setup lang="ts">

import {PropType, ref, watch} from "vue";

const props = defineProps({
  value: {
    type: Number,
    required: true
  },
  onUpdate: {
    type: Function as PropType<(value: Number) => Promise<any>>,
    required: true,
  },
  label: String
})

const localValue = ref(props.value)
const loading = ref(false)

function updateValue() {
  localValue.value = props.value
}

watch(() => props.value, () => {
  updateValue()
})

async function commit() {
  if (localValue.value === props.value)
    return;

  try {
    loading.value = true
    await props.onUpdate(localValue.value)
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
    updateValue()
  }
}

</script>

<style lang="scss">
.async-number-input {
  text-align: right;
}
</style>