<script setup lang="ts">
import { useLoader } from '@/composables/useLoader.ts';
import { api } from '@/api';

const { data: events } = useLoader(
  'audit-events',
  () => api.getAuditEvents(),
  [],
);

const eventsReversed = computed(() => {
  return events.value.slice().reverse();
});

useIntervalFn(async () => {
  const newEvents = await api.getAuditEvents({
    after: events.value[events.value.length - 1]?.id,
  });
  events.value.push(...newEvents);
}, 5000);
</script>

<template>
  <div class="flex flex-col gap-2">
    <TransitionGroup>
      <AuditEventCard
        v-for="event in eventsReversed"
        :key="event.id"
        :event="event"
      />
    </TransitionGroup>
  </div>
</template>

<style scoped>
.v-move {
  transition: transform 0.3s;
}
</style>
