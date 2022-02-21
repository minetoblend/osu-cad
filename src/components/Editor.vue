<template>
  <div class="editor">
    <template v-if="editorContext">
      <div class="editor-screen-container">
        <div>
          <compose-screen :context="editorContext"/>
        </div>
      </div>
      <div class="timeline-overview-container">
        <timeline-overview/>
      </div>
    </template>
  </div>
</template>
<script lang="ts">
import {provide, shallowRef} from "vue";
import {EditorContext} from "@/objects/Editor";
import {ResourceProvider} from "@/draw";
import {OsuCadConnector} from "@/networking/connector";
import TimelineOverview from "@/components/TimelineOverview.vue";
import ComposeScreen from "@/components/screen/compose/ComposeScreen.vue";

export default {
  components: {ComposeScreen, TimelineOverview},
  setup() {
    const editorContext = shallowRef<EditorContext>();


    provide('context', editorContext)

    const resourceProvider = new ResourceProvider()

    resourceProvider.load().then(() => {
      editorContext.value = new EditorContext(resourceProvider, new OsuCadConnector('http://localhost:3000'))
    })

    provide('resources', resourceProvider)

    return {
      editorContext,
    }
  }
}
</script>

<style lang="scss">
.editor {
  position: absolute;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;

  .editor-screen-container {
    width: 100%;
    flex-grow: 1;
    flex-shrink: 1;
    position: relative;
  }

  .timeline-overview-container {
    width: 100%;
    flex-basis: 6vh;
    height: 6vh;
    flex-shrink: 0;
    flex-grow: 0;
  }

  .editor-pane {

  }
}
</style>
