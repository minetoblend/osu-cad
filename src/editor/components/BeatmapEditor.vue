<template>
  <div class="editor-view">
    <EditorMenuBar/>
    <div class="editor-screen-container">
      <transition name="editor-screen">
        <timing-screen v-if="currentTab === 'timing'"/>
        <compose-screen v-else-if="currentTab === 'compose'"/>
        <hitsounds-screen v-else-if="currentTab === 'hitsounds'"/>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">

import EditorMenuBar from "@/editor/components/EditorMenuBar.vue";
import TimingScreen from "@/editor/components/timing/TimingScreen.vue";
import {useEditor} from "@/editor";
import ComposeScreen from "@/editor/components/compose/ComposeScreen.vue";
import HitsoundsScreen from "@/editor/components/hitsounds/HitsoundsScreen.vue";

const {currentTab} = useEditor()

</script>

<style lang="scss">

.editor-view {
  position: absolute;
  inset: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: stretch;

  .editor-screen-container {
    flex: 1;
    overflow: hidden;
    position: relative;

  }
}

</style>
