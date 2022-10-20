<template>
  <n-button v-bind="$attrs" @click.stop="handleClick" :loading="loading">
    <template v-for="(_, slot) in $slots" v-slot:[slot]="scope">
      <slot :name="slot" v-bind="scope || {}">
      </slot>
    </template>
  </n-button>
</template>

<script setup lang="ts">

import {PropType, ref} from "vue";

const props = defineProps({
  onClick: {
    type: Function as PropType<() => Promise<any>>
  }
})

const loading = ref(false)

async function handleClick() {
  if (!props.onClick)
    return;

  try {
    loading.value = true
    await props.onClick()
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}
</script>