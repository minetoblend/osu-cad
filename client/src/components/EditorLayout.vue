<template>
  <div class="editor-layout">
    <div class="menubar" :options="fileMenu">
      <div class="menus">
        <n-dropdown :options="fileMenu" @select="handleFileMenu">
          <n-button quaternary size="large">
            File
          </n-button>
        </n-dropdown>
      </div>
      <div class="tabs">
        <n-button quaternary size="large"
                  :secondary="currentScreen === 'compose'"
                  :type="currentScreen === 'compose' ? 'primary':'default'"
                  @click="currentScreen = 'compose'">
          Compose
        </n-button>
        <n-button quaternary size="large"
                  :secondary="currentScreen === 'timing'"
                  :type="currentScreen === 'timing' ? 'primary':'default'"
                  @click="currentScreen = 'timing'">
          Timing
        </n-button>
      </div>
    </div>

    <div class="editor-screen-container">
      <div v-show="currentScreen === 'compose'">
        <slot name="compose"/>
      </div>
      <slot name="timing" v-if="currentScreen === 'timing'"/>
    </div>
    <slot name="timeline-overview"/>
  </div>
</template>

<script setup lang="ts">
import {ref} from "vue";
import {DropdownOption} from "naive-ui";
import {exportBeatmapState} from "@/util/export";
import {useContext} from "@/editor";

const currentScreen = ref<'compose' | 'timing'>('compose')
const ctx = useContext()

const fileMenu: DropdownOption[] = [
  {
    key: 'export:osu',
    label: 'Export as .osu'
  }
]

function handleFileMenu(item: string) {
  if (item === 'export:osu') {
    exportBeatmapState(ctx.beatmap)
  }
}

</script>

<style lang="scss">

.menubar {
  display: flex;
  justify-content: space-between;
}

.editor-layout {

  display: flex;
  flex-direction: column;
  user-select: none;
  height: 100vh;
  overflow: hidden;

  .editor-screen-container {
    flex-grow: 1;

    > * {
      width: 100%;
      height: 100%;
    }
  }
}
</style>