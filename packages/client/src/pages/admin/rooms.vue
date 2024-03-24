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
  <div class="text-xl">
    {{ rooms.length }} active room{{ rooms.length === 1 ? '' : 's' }}
  </div>
  <div class="mt-6 flex flex-col gap-3">
    <TransitionGroup name="room-card">
      <AdminRoomInfoCard
        v-for="room in sortedRooms"
        :key="room.beatmap.id"
        :room="room"
      />
    </TransitionGroup>
  </div>
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
</style>
