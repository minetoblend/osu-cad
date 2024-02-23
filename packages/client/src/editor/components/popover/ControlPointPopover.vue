<script setup lang="ts">
import {clamp} from "@vueuse/core";
import {ControlPoint, ControlPointUpdateFlags, EditorCommand, SerializedControlPoint} from "@osucad/common";
import {useEditor} from "@/editor/editorContext.ts";
import {Ticker} from "pixi.js";
import {TimelinePositionManager} from "@/editor/drawables/timeline/timelinePositionManager.ts";
import {PopoverData} from "@/editor/components/popover/index.ts";

interface SliderProperties {
  time: number;
  velocityEnabled: boolean;
  velocity: number;
  timingEnabled: boolean;
  bpm: number;
}

const props = defineProps<{
  controlPoint: ControlPoint
  positionManager: TimelinePositionManager,
  popover: PopoverData
}>()

const editor = useEditor()

const properties: SliderProperties = reactive({
  time: props.controlPoint.time,
  velocityEnabled: props.controlPoint.velocityMultiplier !== null,
  velocity: props.controlPoint.velocityMultiplier ?? 1,
  timingEnabled: props.controlPoint.timing !== null,
  bpm: 60000 / ((props.controlPoint.timing?.beatLength) ?
          props.controlPoint.timing.beatLength :
          editor.beatmapManager.controlPoints.timingPointAt(props.controlPoint.time).timing.beatLength
  )
})

function update(update: Partial<SerializedControlPoint>) {
  editor.commandManager.submit(EditorCommand.updateControlPoint({
    controlPoint: props.controlPoint.id,
    update
  }))
}

function commit() {
  editor.commandManager.commit()
}

const time = computed({
  get: () => props.controlPoint.time,
  set: (value) => {
    update({time: value})
  }
})

const velocity = computed({
  get: () => properties.velocity,
  set: (value) => {
    update({velocityMultiplier: value})
  }
})

const velocityEnabled = computed({
  get: () => properties.velocityEnabled,
  set: (value) => {
    if (value)
      update({velocityMultiplier: properties.velocity})
    else
      update({velocityMultiplier: null})
    commit()
  }
})

const bpm = computed({
  get: () => properties.bpm,
  set: (value) => {
    update({
      timing: {
        ...props.controlPoint.timing,
        beatLength: 60_000 / value
      }
    })
  }
})

const timingEnabled = computed({
  get: () => properties.timingEnabled,
  set: (value) => {
    if (value)
      update({
        timing: {
          beatLength: 60_000 / properties.bpm
        }
      })
    else
      update({timing: null})
    commit()
  }
})

const lazyVelocity = ref(Math.round(velocity.value * 10) / 10)
const lazyBpm = ref(Math.round(bpm.value * 10) / 10)
const lazyTime = ref(Math.round(time.value))

watch(velocity, (newVal) => {
  lazyVelocity.value = Math.round(newVal * 10) / 10;
})

watch(bpm, (newVal) => {
  lazyBpm.value = Math.round(newVal * 10) / 10;
})

watch(time, (newVal) => {
  lazyTime.value = Math.round(newVal);
})

function updatePosition() {
  props.popover.position.x = clamp(
      props.positionManager.worldTransform.tx +
      props.positionManager.getPositionForTime(props.controlPoint.time) *
      props.positionManager.worldTransform.a + 10,
      75,
      window.innerWidth - 375
  )
}

Ticker.shared.add(updatePosition);

function updateVelocity() {
  velocity.value = clamp(lazyVelocity.value, 0.1, 10);
  commit()
}

function updateBpm() {
  bpm.value = clamp(lazyBpm.value, 1, 5000);
  commit()
}

function updateTime() {
  time.value = clamp(lazyTime.value, 0, editor.clock.songDuration);
  commit()
}

function onControlPointUpdate(controlPoint: ControlPoint, flags: ControlPointUpdateFlags) {
  if (flags & ControlPointUpdateFlags.Timing) {
    properties.timingEnabled = controlPoint.timing !== null;
    if (controlPoint.timing !== null) {
      properties.bpm = (controlPoint.timing.beatLength) ? 60000 / controlPoint.timing.beatLength : 120;
    }
  }
  if (flags & ControlPointUpdateFlags.Velocity) {
    properties.velocityEnabled = controlPoint.velocityMultiplier !== null;
    properties.velocity = controlPoint.velocityMultiplier ?? 1;
  }
}

props.controlPoint.onUpdate.addListener(onControlPointUpdate);

onBeforeUnmount(() => {
  Ticker.shared.remove(updatePosition);
  props.controlPoint.onUpdate.removeListener(onControlPointUpdate);
})

</script>

<template>
  <q-card class="controlpoint-popover" flat>
    <q-card-section>
      <div class="row no-wrap items-center">
        <q-input v-model="lazyTime"
                 label="Time"
                 stack-label
                 type="number"
                 dense
                 filled
                 style="min-width: 200px"
                 @change="updateTime"
        />
      </div>
      <hr>
      <div class="row no-wrap items-center">
        <div style="padding: 0.5rem">
          <q-toggle v-model="timingEnabled" dense/>
        </div>
        <div>
          Timing
        </div>
      </div>
      <div class="row no-wrap items-center q-gutter-md">
        <q-slider v-model="bpm"
                  :min="30"
                  :max="400"
                  :step="1"
                  dense
                  :class="{disabled: !timingEnabled}"
                  style="padding: 0.5rem;"
                  @change="commit"
        />
        <q-input v-model="lazyBpm"
                 label="bpm"
                 type="number"
                 :min="30"
                 :max="400"
                 :step="1"
                 dense
                 filled
                 :class="{disabled: !timingEnabled}"
                 style="min-width: 120px"
                 @change="updateBpm"
        />
      </div>
      <hr>
      <div class="row no-wrap items-center q-gutter-md">
        <div style="padding: 0.5rem">
          <q-toggle v-model="velocityEnabled" dense/>
        </div>
        <div>
          Velocity
        </div>
      </div>
      <div class="row no-wrap items-center">
        <q-slider v-model="velocity"
                  :min="0.1"
                  :max="10"
                  :step="0.05"
                  dense
                  :class="{disabled: !velocityEnabled}"
                  @change="commit"
                  style="padding: 0.5rem;"
        />

        <q-input v-model="lazyVelocity"
                 type="number"
                 :min="0.1"
                 :max="10"
                 :step="0.1"
                 dense
                 filled
                 :class="{disabled: !velocityEnabled}"
                 style="min-width: 100px"
                 @change="updateVelocity"
        />
      </div>
    </q-card-section>
  </q-card>
</template>

<style lang="scss">
.controlpoint-popover {
  width: 350px;
}

.disabled {
  opacity: 0.5;
}
</style>