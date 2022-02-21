<template>
  <div class="compose-screen">
    <div class="toolbar">
      <toolbar :tool-manager="toolManager"/>
    </div>
    <div class="playfield-container" ref="playfieldContainer" @contextmenu.stop.prevent>
    </div>
  </div>
</template>

<script lang="ts">


import {defineComponent, provide, ref} from "vue";
import {EditorContext} from "@/objects/Editor";
import {ToolManager} from "@/components/screen/compose/tool.manager";
import {SelectTool} from "@/tools/select.tool";
import {HitcirclePlacementTool} from "@/tools/hitcircle.placement.tool";
import {setupPlayfield} from "@/components/screen/compose/playfield";
import {createApp} from "@/components/screen/compose/app";
import Toolbar from "@/components/screen/compose/Toolbar.vue";

export default defineComponent({
  components: {Toolbar},
  props: [
    'context'
  ],
  setup(props) {

    const app = createApp()
    provide('app', app)

    const context: EditorContext = props.context

    const playfieldContainer = ref<HTMLDivElement>()

    const playfield = setupPlayfield(context, playfieldContainer, app)

    const toolManager = new ToolManager(
        context,
        playfield,
        SelectTool,
        HitcirclePlacementTool,
    )

    toolManager.tool.value = toolManager.tools[1] //select hitcircle tool

    return {
      playfieldContainer,
      toolManager,
    }
  }
})
</script>

<style lang="scss">
.compose-screen {
  background-color: black;
  width: 100%;
  height: 100%;
  position: absolute;
  display: flex;


  .toolbar {
    background-color: $gray-200;
    padding: 10px;
    display: flex;
    flex-direction: column;

    h4 {
      font-weight: lighter;
      font-size: 1.2rem;
      margin: 3px 0;
    }

    .tool-button {
      display: block;
      margin-bottom: 5px;
      background-color: $gray-100;
      border: none;
      color: white;
      padding: 7px 10px;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;


      &.active {
        background-color: $primary;
      }
    }
  }

  .playfield-container {
    width: 100%;
  }
}
</style>