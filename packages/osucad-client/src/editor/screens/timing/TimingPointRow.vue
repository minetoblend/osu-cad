<script setup lang="ts">
import {TimingPoint} from "@osucad/common";
import SharedTextInput from "../../../components/SharedTextInput.vue";
import {formatTimestamp} from "@/utils/format";

defineProps<{
  timingPoint: TimingPoint;
}>();
</script>

<template>
  <div class="timing-point-row">
    <div class="offset">
      {{ formatTimestamp(timingPoint.offset) }}
    </div>
    <SharedTextInput
      v-model.int="timingPoint.offset"
      :id="`timingPoint:` + timingPoint.id + ':offset'"
    />

    <div class="timing">
      <SharedTextInput
        v-model.number="timingPoint.bpm"
        :id="`timingPoint:` + timingPoint.id + ':bpm'"
      />
      bpm
    </div>
  </div>
</template>

<style lang="scss">
.timing-point-row {
  height: 36px;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0.5rem;
  border-bottom: 1px solid rgba(#ccc, 0.2);
  box-sizing: border-box;
  gap: 10px;

  .offset {
    width: 150px;
  }

  .offset-input {
    width: 150px;
  }

  .timing {
    width: 150px;
    display: flex;
    gap: 4px;
  }
}
</style>
