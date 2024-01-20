<script setup lang="ts">

import {computed} from "vue";

const props = defineProps<{
  id: number
}>();

const imageUrl = computed(() => `url("https://a.ppy.sh/${props.id}")`);
</script>

<template>
  <div class="oc-user-avatar"/>
</template>

<style lang="scss">

$size: 1.5em;

.oc-user-avatar {
  width: $size;
  height: $size;
  background-image: v-bind(imageUrl);
  background-size: cover;
  border-radius: 50%;
  display: inline-block;
  align-self: center;
}
</style>
