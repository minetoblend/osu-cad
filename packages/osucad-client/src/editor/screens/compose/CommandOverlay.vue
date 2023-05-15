<script setup lang="ts">
import { Command } from "@/editor/commands/command";
import CommandPropInput from "./CommandPropInput.vue";

const props = defineProps<{
  command: Command;
}>();
</script>

<template>
  <div class="command-overlay">
    <h4>{{ command.name }}</h4>
    <div v-for="prop in command.props" :key="prop.name" class="prop">
      <label class="prop-label">
        {{ prop.name }}
      </label>
      <div class="prop-input">
        <CommandPropInput :command="command" :prop="prop" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.command-overlay {
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  background: #343440;

  h4 {
    margin: 0;
    padding: 0.5rem;
  }
}
</style>
