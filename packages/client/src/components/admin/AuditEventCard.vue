<script setup lang="ts">
import { AuditEventInfo } from '@osucad/common';

const props = defineProps<{
  event: AuditEventInfo;
}>();

const formattedTimestamp = computed(() => {
  return new Date(props.event.timestamp).toLocaleString();
});

const formattedAction = computed(() => {
  switch (props.event.action) {
    case 'login':
      return 'Login';
    case 'logout':
      return 'Logout';
    case 'mapset.import':
      return 'Imported mapset';
    case 'beatmap.delete':
      return 'Deleted beatmap';
    case 'room.join':
      return 'Joined room';
    case 'room.leave':
      return 'Left room';
  }
  return props.event.action;
});

const details = computed(() => {
  return Object.entries(props.event.details);
});
</script>

<template>
  <div class="bg-gray-300 p-3 rounded">
    <div class="flex items-center gap-4">
      <div class="flex items-center gap-2">
        <img :src="event.user.avatarUrl!" class="w-8 h-8 rounded-full" />
        {{ event.user.username }}
      </div>
      <div class="text-gray-600">{{ formattedAction }}</div>
      <div class="flex-1"></div>
      <div>
        {{ formattedTimestamp }}
      </div>
    </div>
    <div class="mt-4 text-sm">
      <div v-for="[key, value] in details">
        <div class="flex items-center gap-2">
          <div class="font-semibold">{{ key }}</div>
          <div class="text-gray-600">{{ value }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
