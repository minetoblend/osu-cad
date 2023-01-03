<template>
  <div class="track-editor">
    <track-channel-editor v-for="(channel, index) in track.channels" :key="index" :channel="channel">

    </track-channel-editor>
  </div>
</template>

<script setup lang="ts">

import TrackChannelEditor from "@/editor/components/hitsounds/TrackChannelEditor.vue";

const props = defineProps<{
  track: any
}>()

</script>

<style lang="scss">
.track-editor {

}
</style>
