<script setup lang="ts">
import axios from 'axios';
import { UserInfo } from '@osucad/common';

const searchTerm = ref('');
const debouncedSearchTerm = debouncedRef(searchTerm, 500);

const users = asyncComputed(async () => {
  const term = debouncedSearchTerm.value.trim();
  const response = await axios.get<UserInfo[]>('/api/admin/users', {
    params: {
      limit: 25,
      offset: 0,
      search: term || undefined,
    },
  });
  return response.data;
});
</script>

<template>
  <TextInput v-model="searchTerm" type="search" placeholder="Search" />
  <div class="mt-6 flex flex-col gap-3">
    <TransitionGroup name="user-card">
      <AdminUserCard v-for="user in users" :key="user.id" :user="user" />
    </TransitionGroup>
  </div>
</template>

<style lang="scss" scoped>
.user-card {
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
