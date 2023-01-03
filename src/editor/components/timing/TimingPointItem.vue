<template>
  <div class="timing-point" :class="{selected}">
    <div class="offset">
      <editable-label v-model="timingPoint.offset" number round transaction="Update Timing Point">
          {{ formatTimestamp(timingPoint.offset) }}
      </editable-label>
    </div>
    <div class="timing">
      <editable-label v-if="timingPoint.timing" v-model="timingPoint.timing.bpm" number
                      transaction="Update Timing Point">
        {{ bpm }}bpm
      </editable-label>
    </div>
  </div>
</template>

<script setup lang="ts">
import {formatTimestamp} from "@/util/timestamp";
import {TimingPoint} from "@/editor/state/timingPoint";
import EditableLabel from "@/components/EditableLabel.vue";
import {computed} from "vue";

const props = defineProps<{
  timingPoint: TimingPoint,
  selected: boolean
}>()

const bpm = computed(() => {
  if (props.timingPoint.timing) {
    return (props.timingPoint.timing.bpm).toFixed(1)
  } else {
    return ''
  }
})

</script>

<style lang="scss" scoped>
.timing-point {
  cursor: pointer;
  display: flex;
  align-items: stretch;
  gap: 12px;

  &.selected {
    background-color: rgba(#63E2B7, 0.2);
  }
}


.offset {
  width: 120px;
  text-align: right;
  //padding-right: 8px;
}

.bpm {

}

</style>
