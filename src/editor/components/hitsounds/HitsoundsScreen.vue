<template>
  <editor-screen class="hitsounds-screen">

    <pane>
      <track-editor :track="state.hitSounds.track"/>
    </pane>

  </editor-screen>
</template>
<script setup lang="ts">
import EditorScreen from "@/editor/components/EditorScreen.vue";
import TrackEditor from "@/editor/components/hitsounds/TrackEditor.vue";
import Pane from "@/components/Pane.vue";
import {useEditor} from "@/editor";

const {state} = useEditor()


</script>

<style lang="scss">

.hitsounds-screen {
  padding: 48px;

}

</style>
