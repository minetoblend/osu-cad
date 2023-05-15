<script setup lang="ts">
import ToolbarButton from "@/components/ToolbarButton.vue";
import { ToolInstance, createTool } from "./tool";
import { SelectTool } from "./tool/selectTool";
import { useVModel } from "@vueuse/core";
import { CircleTool } from "./tool/circleTool";
import { SliderTool } from "./tool/sliderTool";

const props = defineProps<{
  activeTool: ToolInstance;
}>();

const activeTool = useVModel(props, "activeTool");

const tools = [SelectTool, CircleTool, SliderTool];
</script>

<template>
  <div class="toolbar">
    <ToolbarButton
      v-for="(tool, index) in tools"
      :key="index"
      :active="activeTool.tool === tool"
      @click="activeTool = createTool(tool)"
    >
      <img :src="tool.icon" />
    </ToolbarButton>
  </div>
</template>

<style lang="scss" scoped>
.toolbar {
  display: flex;
  flex-direction: column;
  justify-content: start;
}
</style>
