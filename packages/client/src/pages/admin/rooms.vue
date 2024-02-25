<script setup lang="ts">
import axios from 'axios';
import { RoomInfo } from '@osucad/common';
import AdminRoomInfoCard from '@/components/admin/AdminRoomInfoCard.vue';

const { state: rooms, execute } = useAsyncState<RoomInfo[]>(
  async () => {
    const response = await axios.get<RoomInfo[]>('/api/admin/rooms');
    return response.data;
  },
  [],
  {
    resetOnExecute: false,
  },
);

useIntervalFn(() => {
  execute();
}, 2000);

const sortedRooms = useSorted(rooms, (a, b) => {
  return b.userCount - a.userCount;
});
</script>

<template>
  <page-layout>
    <div class="text-h5">
      {{ rooms.length }} active room{{ rooms.length === 1 ? '' : 's' }}
    </div>
    <div class="col q-gutter-md">
      <transition-group name="room-card">
        <admin-room-info-card
          v-for="room in sortedRooms"
          :key="room.beatmap.id"
          :room="room"
        />
      </transition-group>
    </div>
  </page-layout>
</template>

<style lang="scss" scoped>
.room-card {
  &-enter-active,
  &-leave-active,
  &-move {
    transition: all 0.3s;
  }

  &-enter-from,
  &-leave-to {
    opacity: 0;
    transform: translateY(20px);
  }
}

.user {
  &-enter-active,
  &-leave-active {
    transition: all 0.3s;
  }

  &-enter-from,
  &-leave-to {
    opacity: 0;
    transform: translateY(-20px);
  }
}
</style>
