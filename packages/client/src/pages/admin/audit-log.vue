<script setup lang="ts">
import { useLoader } from '@/composables/useLoader.ts';
import { api } from '@/api';

const { data: events } = useLoader(
  'audit-events',
  () => api.getAuditEvents(),
  [],
);

useIntervalFn(async () => {
  const newEvents = await api.getAuditEvents({
    after: events.value[0]?.id,
  });
  events.value.unshift(...newEvents);
}, 5000);
</script>

<template>
  <div class="flex flex-col gap-2">
    <TransitionGroup>
      <AuditEventCard v-for="event in events" :key="event.id" :event="event" />
    </TransitionGroup>
  </div>
</template>

<style scoped>
.v-move {
  transition: transform 0.3s;
}
</style>
