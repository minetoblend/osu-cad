<template>
  <n-switch :value="checked" @update:value="onCheckboxChanged" :loading="loading"/>
</template>

<script setup lang="ts">

import {PropType, ref, watch} from "vue";

const props = defineProps({
  value: {type: Boolean, required: true},
  onUpdate: {
    type: Function as PropType<(value: Boolean) => Promise<any>>,
    required: true,
  }
})

const checked = ref(props.value)
const loading = ref(false)

function updateValue() {
  checked.value = props.value
}

watch(() => props.value, () => {
  updateValue()
})

async function onCheckboxChanged(value: boolean) {
  try {
    loading.value = true
    await props.onUpdate(value)
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
    updateValue()
  }
}

</script>