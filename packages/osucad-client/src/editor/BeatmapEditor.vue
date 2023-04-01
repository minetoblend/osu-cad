<script setup lang="ts">
import {provideContainer} from "@/composables/useContainer";
import Timeline from "./components/Timeline.vue";
import {createEditor, provideEditor} from "./createEditor";
import ComposeScreen from "./screens/compose/ComposeScreen.vue";

const props = defineProps<{
  id: string;
}>();

const editor = await createEditor(props.id);

provideContainer(editor.container);
provideEditor(editor);
</script>
<template>
  <!-- <TimingScreen /> -->
  <div class="osucad-editor">
    <div class="editor-screen-container">
      <ComposeScreen />
    </div>
    <div class="timeline-container">
      <Timeline />
    </div>
  </div>
</template>

<style lang="scss" scoped>

$timelineHeight: 100px;

.osucad-editor{
  position: fixed;
  inset: 0;
  background-color: #1a1a20;
  overflow: hidden;

  .editor-screen-container {
    position: absolute;
    inset: 0 0 $timelineHeight 0;
  }

  .timeline-container {
    position: absolute;
    height: $timelineHeight;
    left: 0;
    right: 0;
    bottom: 0;
  }
}
</style>
