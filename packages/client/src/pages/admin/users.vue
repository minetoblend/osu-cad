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
  <page-layout>
    <div class="column q-gutter-md">
      <div class="flex">
        <q-input
          v-model="searchTerm"
          style="width: 300px"
          filled
          dense
          label="Search"
        />
      </div>
      <transition-group name="user-card">
        <q-card flat v-for="user in users" :key="user.id">
          <q-card-section>
            <div class="row">
              <q-avatar rounded size="25px" class="q-mr-sm">
                <img :src="user.avatarUrl" :alt="user.username" />
              </q-avatar>
              {{ user.username }}
              <q-space />
              Joined
              {{
                new Date(user.created).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'numeric',
                  day: 'numeric',
                })
              }}
            </div>
          </q-card-section>
        </q-card>
      </transition-group>
    </div>
  </page-layout>
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
