<template>
  <shortcut-receiver @shortcut="handleShortcut">
    <editor-layout>
      <template #compose>
        <compose-screen/>
      </template>
      <template #timing>
        <timing-screen/>
      </template>
      <template #timeline-overview>
        <timeline-overview/>
      </template>
    </editor-layout>
    <!--    <div class="editor-container">-->
    <!--      <div class="editor-screen-container">-->
    <!--        <n-tabs type="line" style="height: 100%">-->
    <!--          <n-tab-pane name="compose" tab="Compose" display-directive="show">-->
    <!--            <ComposeScreen/>-->
    <!--          </n-tab-pane>-->
    <!--          <n-tab-pane name="timing" tab="Timing">-->
    <!--            <TimingScreen/>-->
    <!--          </n-tab-pane>-->
    <!--        </n-tabs>-->
    <!--      </div>-->
    <!--      <TimelineOverview/>-->

    <div class="user-list-container">
      <UserList/>
    </div>
    <n-card class="chat-container" v-if="true">
      <ChatView :client="client" :session="session" :socket="socket" :room-name="ctx.beatmapId"/>
    </n-card>
    <!--    </div>-->
  </shortcut-receiver>
</template>

<script setup lang="ts">

import TimingScreen from "@/editor/components/screens/TimingScreen.vue";
import TimelineOverview from "@/editor/components/TimelineOverview.vue";
import {useContext} from "@/editor";
import ChatView from "@/components/ChatView.vue";
import UserList from "@/components/UserList.vue";
import ShortcutReceiver from "@/components/ShortcutReceiver.vue";
import ComposeScreen from "@/editor/components/screens/ComposeScreen.vue";
import {findCurrentTimingPoint, snapTime} from "@/editor/state/timing";
import EditorLayout from "@/components/EditorLayout.vue";

const ctx = useContext()
const client = ctx.connector.client
const session = ctx.connector.session
const socket = ctx.connector.socket

function handleShortcut(evt: CustomEvent) {
  switch (evt.detail) {
    case 'space':
      ctx.clock.togglePlaying()
  }

  if (evt.detail === 'arrowleft') {
    let time = ctx.clock.time;

    const timingPoint = findCurrentTimingPoint(ctx.state.beatmap.timing.uninheritedTimingPoints, time)

    const divisor = 4
    time -= (timingPoint?.beatLength ?? 800) / divisor
    time = snapTime(ctx.state.beatmap.timing.uninheritedTimingPoints, time, 4)
    ctx.clock.seek(time, true)
  }

  if (evt.detail === 'arrowright') {
    let time = ctx.clock.time;

    const timingPoint = findCurrentTimingPoint(ctx.state.beatmap.timing.uninheritedTimingPoints, time)

    const divisor = 4
    time += (timingPoint?.beatLength ?? 800) / divisor
    time = snapTime(ctx.state.beatmap.timing.uninheritedTimingPoints, time, 4)
    ctx.clock.seek(time, true)
  }

}

window.addEventListener("wheel", evt => {
  let time = ctx.clock.time;

  const timingPoint = findCurrentTimingPoint(ctx.state.beatmap.timing.uninheritedTimingPoints, time)

  const divisor = 4
  let multiplier = 1
  if (evt.shiftKey)
    multiplier *= 4

  if (evt.deltaY > 0)
    time += (timingPoint?.beatLength ?? 800) / divisor * multiplier
  else
    time -= (timingPoint?.beatLength ?? 800) / divisor * multiplier
  time = snapTime(ctx.state.beatmap.timing.uninheritedTimingPoints, time, 4)
  ctx.clock.seek(time, true)
})

</script>

<style lang="scss">
.editor-container {

  display: flex;
  flex-direction: column;
  user-select: none;

  .editor-screen-container {
    flex-grow: 1;
  }

  .n-tabs {
    display: flex !important;
    flex-direction: column;

    .n-tab-pane {
      flex-grow: 1;
    }
  }
}

.chat-container {
  position: absolute;
  right: 20px;
  bottom: 64px;
  max-width: 300px;
  max-height: 90vh;
  height: 500px;

  .n-card__content {
    max-height: 100%;
  }
}

.user-list-container {
  position: absolute;
  right: 20px;
  top: 64px;
  pointer-events: none;
}

</style>