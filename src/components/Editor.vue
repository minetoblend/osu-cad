<template>
  <div class="editor">
    <template v-if="editorContext">
      <play-field :context="editorContext" :app="app">

      </play-field>
    </template>
  </div>
</template>
<script lang="ts">
import PlayField from "./PlayField";
import {onBeforeUnmount, provide, shallowRef} from "vue";
import {EditorContext} from "@/objects/Editor";
import {ResourceProvider} from "@/draw";
import {PIXI} from "@/pixi";

export default {
  components: {PlayField},
  setup() {
    const editorContext = shallowRef<EditorContext>();

    const app = new PIXI.Application({
      width: 800,
      height: 600,
    })

    provide('context', editorContext)
    provide('app', app)

    const resourceProvider = new ResourceProvider()
    resourceProvider.load().then(() => {
      editorContext.value = new EditorContext(app, resourceProvider)
    })

    onBeforeUnmount(() =>
        app.destroy()
    )

    return {
      editorContext,
      app,
    }
  }
}
</script>

<style lang="scss">
.editor {
  width: 100vw;
  height: 100vh;
}
</style>
