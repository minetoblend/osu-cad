<script setup lang="ts">
import {TimingPoint, TimingPointCollection} from "@osucad/common";
import {shallowRef} from "vue";
import {useContainer} from "@/composables/useContainer";
import TimingPointRow from "./TimingPointRow.vue";
import Timeline from "../../components/Timeline.vue";
import {useEditor} from "@/editor/createEditor";


const container = useContainer()!;

const timing = container.document.objects.timing as TimingPointCollection;
const { clock } = useEditor()!

const timingPoints = shallowRef<TimingPoint[]>(timing.items);

timing.on("change", items => {
  timingPoints.value = items;
});

function createTimingPoint() {
  const timingPoint = new TimingPoint(container.runtime)
  timingPoint.offset = Math.round(clock.currentTime)
  timing.insert(timingPoint)
}
</script>

<template>
  <div class="timing-screen">
    <div class="timing-point-table">
      <RecycleScroller :items="timingPoints" :item-size="36" key-field="id" v-slot="{item}" style="height: 100%">
        <TimingPointRow :timing-point="item"/>
      </RecycleScroller>
    </div>
    <button @click="createTimingPoint">
      Add new Timing Point
    </button>
    <!--    <Timeline class="timeline" />-->
  </div>
</template>

<style lang="scss" scoped>
.timing-screen {
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: #1a1a20;


  .timeline {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;

  }
}
</style>
