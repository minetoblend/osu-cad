<template>
  <n-space vertical>
    <async-number-input label="time"
                        :value="timingPoint.time"
                        :on-update="bpm => setTime(timingPoint, bpm)"/>


    <async-switch :value="!!timingPoint.timing"
                  :on-update="hasTiming => setTiming(timingPoint, hasTiming)"/>

    <n-collapse-transition :show="!!timingPoint.timing">
      <async-number-input label="bpm"
                          :value="timingPoint.bpm"
                          :on-update="bpm => setBpm(timingPoint, bpm)"/>
    </n-collapse-transition>

    <async-number-input label="sv"
                        :value="timingPoint.sv"
                        :on-update="sv => setSv(timingPoint, sv)"/>

  </n-space>
</template>

<script setup lang="ts">
import {PropType} from "vue";
import {TimingPoint} from "@/editor/state/timing";
import {ClientOpCode} from "@common/opcodes";
import {SerializedTimingPoint} from "@common/types";
import {useContext, useState} from "@/editor";
import AsyncSwitch from "@/components/AsyncSwitch.vue";
import AsyncNumberInput from "@/components/AsyncNumberInput.vue";

const props = defineProps({
  timingPoint: {
    type: Object as PropType<TimingPoint>,
    required: true
  }
})

const ctx = useContext()
const state = useState()

async function setTiming(timingPoint: TimingPoint, hasTiming: boolean) {
  updateTimingPoint(timingPoint, t => {
    if (hasTiming && !t.timing) {
      t.timing = state.timing.getTimingPointAt(ctx.currentTime, true)?.timing ?? {
        bpm: 180,
        signature: 4
      }
    } else if (!hasTiming) {
      t.timing = undefined
    }
  })
}

function setBpm(timingPoint: TimingPoint, bpm: number) {
  return updateTimingPoint(timingPoint, t => t.timing!.bpm = bpm)
}


function setSv(timingPoint: TimingPoint, sv: number) {
  return updateTimingPoint(timingPoint, t => t.sv = sv)
}

function setTime(timingPoint: TimingPoint, time: number) {
  return updateTimingPoint(timingPoint, t => t.time = time)
}


async function updateTimingPoint(timingPoint: TimingPoint, update: (timingPoint: SerializedTimingPoint) => void) {
  const serializedTimingPoint = timingPoint.serialized()

  update(serializedTimingPoint)

  return ctx.sendMessage(ClientOpCode.UpdateTimingPoint, serializedTimingPoint)

}


</script>