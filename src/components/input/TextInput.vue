<template>
  <div class="input-group">
    <label>
      <slot name="label">
        {{ label }}
      </slot>
    </label>
    <presence-container class="presences" :presences="presences">
      <input type="text" ref="input" v-model="value">
    </presence-container>
  </div>
</template>

<script setup lang="ts">

import {computed, ref} from "vue";
import {useFocus, useVModel} from "@vueuse/core";
import PresenceContainer from "../PresenceContainer.vue";

const props = defineProps<{
  modelValue: string;
  label?: string;
}>();

const input = ref<HTMLInputElement>();

const value = useVModel(props, 'modelValue');

const {focused: inputActive} = useFocus(input);

const presences = computed(() => {
  let presences = []

  if (inputActive.value) {
    presences.push({'name': "Maarvin", color: '#EA2463', id: 'test'})
  }

  return presences
})
</script>

<style lang="scss" scoped>
.input-group {
  display: flex;
  border-radius: var(--border-radius);
  padding-left: 13px;
  align-items: center;

  &:hover input {
    background-color: rgba(255, 255, 255, 0.1);
  }
}

label {
  min-width: 150px;
}

.presences {
  flex-grow: 1;
  display: flex;
}

input {
  padding: 8px 13px;
  border: none;
  flex-grow: 1;
  background: transparent;
  color: inherit;
  font-size: inherit;
  box-shadow: 0 0 0 transparent;


  transition: background-color 100ms linear, box-shadow 100ms linear;


  border-radius: var(--border-radius);

  caret-shape: underscore !important;

  &:focus {
    outline: none;
  }
}

</style>
