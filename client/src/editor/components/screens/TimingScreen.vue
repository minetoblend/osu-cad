<template>
  <div class="editor-screen timing-screen">
    <div class="timingpoint-list">
      <n-scrollbar style="max-height: 100%">
        <n-table class="timing-table">
          <tbody>
          <tr v-for="timingPoint in state.timing.timingPoints" :key="timingPoint.id" class="entry"
              @click="setSelected(timingPoint, !isSelected(timingPoint), true)">
            <td>
              <n-checkbox :checked="isSelected(timingPoint)"
                          @update:checked="setSelected(timingPoint, $event)"
                          @click.stop
              />
            </td>
            <td>
              {{ formatTimestamp(timingPoint.time) }}
            </td>
            <td>
              {{ timingPoint.timing }}
            </td>
            <td>
              {{ timingPoint.sv }}
            </td>
            <td>
              {{ timingPoint.volume }}
            </td>
            <td class="shrink">
              <async-button circle #icon :on-click="() => deleteTimingPoint(timingPoint)">
                &times
              </async-button>
            </td>
          </tr>
          </tbody>
        </n-table>
      </n-scrollbar>
    </div>
    <div class="timingpoint-settings">
      <async-button type="primary" ghost :on-click="createTimingPoint">
        Add Timing Point
        <template #icon>
          +
        </template>
      </async-button>
      <n-divider/>
      <TimingPointSettings v-if="selectedTimingPoints.length === 1" :timing-point="selectedTimingPoints[0]"/>
    </div>
  </div>
</template>

<script setup lang="ts">

import {useContext, useState} from "@/editor";
import {TimingPoint} from "@/editor/state/timing";
import {computed, ref} from "vue";
import {formatTimestamp} from "@/util/time";
import TimingPointSettings from "@/editor/components/TimingPointSettings.vue";
import AsyncButton from "@/components/AsyncButton.vue";

const ctx = useContext()
const state = useState()
const selection = ref(new Set<number>())


function createTimingPoint() {
  return ctx.sendMessage('createTimingPoint', {
        offset: ctx.currentTime,
        timing: null,
        volume: null,
        sv: null,
        id: 0
      }
  )
}

function deleteTimingPoint(timingPoint: TimingPoint) {
  return ctx.sendMessage('deleteTimingPoint', [timingPoint.id])
}


function isSelected(timingPoint: TimingPoint) {
  return selection.value.has(timingPoint.id)
}

function setSelected(timingPoint: TimingPoint, selected: boolean, clear = false) {
  if (clear)
    selection.value.clear()

  if (selected)
    selection.value.add(timingPoint.id)
  else
    selection.value.delete(timingPoint.id)
}

const selectedTimingPoints = computed(() => {
  return [...selection.value.values()]
      .map(id => state.timing.findById(id))
      .filter(it => it)
})


</script>

<style lang="scss">

.timing-screen {
  padding: 1rem 20rem;

  display: flex;

  .timingpoint-list {
    flex: 2 1 auto;

    margin-right: 12px;
  }

  .timingpoint-settings {
    flex: 1 1 auto;
  }

}

.timing-table {
  .entry {
    &:hover td, &.selected td {
      background-color: rgba(255, 255, 255, 0.1);
    }
  }

  .shrink {
    width: 0;
  }
}

</style>