<template>
  <h4>Tools</h4>
  <button class="tool-button" v-for="tool in toolManager.tools" :class="{active: tool === toolManager.tool.value}" @click="toolManager.tool.value = tool">
    {{ tool.name }}
  </button>
</template>

<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
  props: [
      'toolManager'
  ],
  setup(props) {
    return {
      toolManager: props.toolManager
    }
  }
})
</script>