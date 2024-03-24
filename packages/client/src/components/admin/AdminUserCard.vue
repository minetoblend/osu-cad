<script setup lang="ts">
import { UserInfo } from '@osucad/common';

const props = defineProps<{
  user: UserInfo;
}>();

const joinDate = computed(() =>
  new Date(props.user.created).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }),
);
</script>

<template>
  <div class="bg-gray-300 rounded p-3">
    <div class="flex gap-2">
      <div class="flex-1 flex gap-2">
        <img
          :src="user.avatarUrl!"
          class="w-10 h-10 rounded-full"
          :alt="user.username"
        />
        <div class="ml-2 font-bold">{{ user.username }}</div>
      </div>
      <div>Joined {{ joinDate }}</div>
    </div>
  </div>
</template>
