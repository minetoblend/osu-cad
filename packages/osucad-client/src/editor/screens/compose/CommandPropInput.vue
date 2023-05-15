<script setup lang="ts">
import { Command } from "@/editor/commands/command";
import { PropMetadata } from "@/editor/commands/decorators";
import { computed } from "vue";

const props = defineProps<{
  command: Command;
  prop: PropMetadata;
}>();

const modelValue = computed<any>({
  get: () => (props.command as any)[props.prop.name].value,
  set: (value: any) => {
    (props.command as any)[props.prop.name].value = value;
  },
});
</script>

<template>
  <input v-if="prop.type === 'number'" v-model.number="modelValue" />
  <input v-else-if="prop.type === 'string'" v-model="modelValue" />
  <input v-else-if="prop.type === 'boolean'" type="checkbox" v-model="modelValue" />
  <template v-else-if="prop.type === 'Vec2'">
    <input v-model.number="modelValue.x" />
    <input v-model.number="modelValue.y" />
  </template>
</template>
