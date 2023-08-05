<script setup lang="ts">
import {provideContainer} from "@/composables/useContainer";
import Timeline from "./components/Timeline.vue";
import {createEditor, provideEditor} from "./createEditor";
import ComposeScreen from "./screens/compose/ComposeScreen.vue";
import TimingScreen from "@/editor/screens/timing/TimingScreen.vue";
import {watchDebounced} from "@vueuse/core";

const props = defineProps<{
  id: string;
}>();

const editor = await createEditor(props.id);

provideContainer(editor.container);
provideEditor(editor);

watchDebounced(() => editor.clock.currentTime, (time) => {
  const url = new URL(window.location.href);
  url.searchParams.set("t", time.toString());
  window.history.replaceState({}, "", url.toString());
}, {
  debounce: 1000,
});

</script>
<template>
  <div class="osucad-editor" @contextmenu.prevent>
    <div class="editor-screen-container">
      <!--      <TimingScreen />-->
      <ComposeScreen/>
      <!--      <TimingScreen></TimingScreen>-->
    </div>
    <div class="timeline-container">
      <Timeline/>
    </div>
  </div>
</template>

<style lang="scss" scoped>

$timelineHeight: 100px;

.osucad-editor {
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
