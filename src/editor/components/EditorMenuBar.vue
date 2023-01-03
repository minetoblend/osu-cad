<template>
  <menu-bar v-if="isWeb">
    <div class="editor-menu">

    </div>
    <div class="editor-tab-buttons">
      <tab-button v-model="currentTab" tab="compose">
        Compose
      </tab-button>
      <tab-button v-model="currentTab" tab="timing">
        Timing
      </tab-button>
      <tab-button v-model="currentTab" tab="hitsounds">
        Hitsounds
      </tab-button>
    </div>
    <div class="editor-actions">

    </div>
  </menu-bar>
</template>
<script setup lang="ts">
import MenuBar from "@/components/MenuBar.vue";
import TabButton from "@/components/TabButton.vue";
import {ref} from "vue";
import {useEditor} from "@/editor";
import {usePlatform} from "@/util/platform";

const {currentTab} = useEditor()

const {isWeb} = usePlatform()
</script>

<style lang="scss">

.editor-menu, .editor-actions {
  flex-grow: 1;
}

.editor-tab-buttons {
  display: flex;
  flex-direction: row;
}

</style>
