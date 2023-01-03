<template>
  <editor-screen class="timing-screen">
    <button @click="add">
      Add
    </button>
    <button :disabled="!history.undoHistory.length" @click="history.undo">
      Undo
      <template v-if="history.undoHistory.length">
        {{ history.undoHistory[history.undoHistory.length - 1].name }}
      </template>
    </button>
    <button :disabled="!history.redoHistory.length" @click="history.redo">
      Redo
      <template v-if="history.redoHistory.length">
        {{ history.redoHistory[history.redoHistory.length - 1].name }}
      </template>
    </button>
    <div class="timing-point-list" v-bind="containerProps">
      <div v-bind="wrapperProps">
        <timing-point-item v-for="item in list"
                           :key="item.data.id"
                           :timing-point="item.data"
                           :selected="selection.has(item.data)"
                           @click="toggleSelection($event, item.data)"/>
      </div>
    </div>
  </editor-screen>
</template>
<script setup lang="ts">
import EditorScreen from "@/editor/components/EditorScreen.vue";
import {useEditor} from "@/editor";
import {uniqueId} from "@/util/id";
import {useMagicKeys, useVirtualList, whenever} from "@vueuse/core";
import TimingPointItem from "@/editor/components/timing/TimingPointItem.vue";
import {reactive} from "vue";
import {TimingPoint} from "@/editor/state/timingPoint";

const {timingPoints, history} = useEditor()

const selection = reactive(new Set<TimingPoint>())

function add() {
  history.record('Create Timing Point', () => {
    timingPoints.push({
      id: uniqueId(),
      offset: Math.floor(Math.random() * 1000),
      timing: {
        bpm: 180,
        signature: 4
      },
      volume: null,
      sliderVelocity: null
    })
  })
}

const itemHeight = 36

const {containerProps, wrapperProps, list} = useVirtualList(timingPoints, {
  itemHeight
})

function toggleSelection(event: MouseEvent, timingPoint: TimingPoint) {
  if (event.shiftKey) {
    if (selection.has(timingPoint)) {
      selection.delete(timingPoint)
    } else {
      selection.add(timingPoint)
    }
  } else {
    selection.clear()
    selection.add(timingPoint)
  }
}

const keys = useMagicKeys()

whenever(keys.Delete, () => {
  history.record('Delete Timing Points', () => selection.forEach(it => {
    const index = timingPoints.findIndex(t => t.id === it.id)

    if (index >= 0) {
      timingPoints.splice(index, 1)
    }
  }))
  selection.clear()
})

</script>

<style lang="scss">

.timing-screen {
  padding: 48px;
}

.timing-point-list {
  position: relative;
  height: 100%;
  overflow-x: hidden;
  overflow-y: scroll;

  .timing-point {
    height: 36px;
    display: flex;
    align-items: center;
    padding: 0 10px;
    gap: 12px;
  }
}


</style>
