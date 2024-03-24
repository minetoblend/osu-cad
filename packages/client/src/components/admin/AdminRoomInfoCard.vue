<script setup lang="ts">
import { RoomInfo, BeatmapAccess } from '@osucad/common';

const props = defineProps<{ room: RoomInfo }>();

function translateAccess(access: BeatmapAccess) {
  switch (access) {
    case BeatmapAccess.None:
      return 'None';
    case BeatmapAccess.View:
      return 'View';
    case BeatmapAccess.Modding:
      return 'Modding';
    case BeatmapAccess.Edit:
      return 'Edit';
    case BeatmapAccess.MapsetOwner:
      return 'Mapset Owner';
  }
}

const formattedRoomAge = useTimeAgo(() => new Date(props.room.createdAt));
</script>

<template>
  <div class="bg-gray-300 rounded p-2">
    <div class="flex gap-4">
      <div class="w-20 h-20 rounded overflow-hidden bg-gray-200">
        <img
          v-if="room.beatmap.links.thumbnail"
          :src="room.beatmap.links.thumbnail.href"
          class="cover-parent"
        />
      </div>
      <div class="flex-1">
        <div class="flex">
          <div class="flex-1 text-lg flex items-center gap-2">
            {{ room.mapset.title }}
            <RouterLink :to="room.beatmap.links.edit.href">
              <div class="i-fas-up-right-from-square block" />
            </RouterLink>
          </div>
          <div class="text-caption text-sm text-gray-800">
            Started {{ formattedRoomAge }} ago
          </div>
        </div>
        <div>{{ room.mapset.artist }}</div>
        <div>
          <span class="px-3 rounded bg-primary-600">
            {{ room.beatmap.name }}
          </span>
        </div>
      </div>
    </div>
    <div class="mt-2">
      <div
        class="flex gap-2 my-1"
        v-for="user in room.users"
        :key="user.sessionId"
      >
        <img :src="user.avatarUrl!" class="w-10 h-10 rounded-full" />
        <div>
          <div class="font-bold">{{ user.username }}</div>
          <div class="text-sm text-gray-500">
            {{ translateAccess(user.access) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
