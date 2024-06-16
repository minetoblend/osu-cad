<script setup lang="ts">
import { useEvents } from '../events.ts';

const { events } = useEvents();
</script>

<template>
  <div class="event-list">
    <TransitionGroup name="event">
      <div v-for="event in events" class="event" :key="event.id">
        {{ event.message }}
      </div>
    </TransitionGroup>
    <!--    <img src="@/assets/subway-surfer.gif">-->
  </div>
</template>

<style lang="scss">
.event {
  &-enter-active,
  &-leave-active {
    transition:
      opacity 0.1s ease-out,
      transform 0.1s ease-out;
  }

  &-enter-from,
  &-leave-to {
    opacity: 0;
    transform: translateX(-20px);
  }

  &-move {
    transition: transform 0.1s ease-out;
  }
}
</style>
