<script setup lang="ts">
import { Operator } from '../../editor/operators/operator.ts';

defineProps<{
  operator: Operator;
}>();
</script>

<template>
  <div class="operator-box">
    <div class="header">
      {{ operator.label }}
    </div>
    <div class="parameters">
      <div v-for="(parameter, index) in operator.parameters" :key="index">
        <div class="label">
          {{ parameter.label }}
        </div>
        <div class="parameter-component">
          <component
            :is="parameter.component"
            v-if="parameter.component"
            v-model="parameter.value"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.operator-box {
  background-color: $surface-50;
  width: fit-content;
  padding: 0.5rem;
  border-radius: 4px;
  margin: 1rem;
}
</style>
