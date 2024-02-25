<script setup lang="ts">
import { useCurrentUser } from '@/composables/useCurrentUser.ts';

const { isAdmin } = useCurrentUser();
</script>

<template>
  <template v-if="isAdmin">
    <q-page-container>
      <q-drawer
        side="left"
        class="bg-transparent"
        persistent
        show-if-above
        :width="200"
      >
        <q-scroll-area class="fit">
          <q-list>
            <q-item clickable to="/admin/rooms">
              <q-item-section>Active Rooms</q-item-section>
            </q-item>
            <q-item clickable to="/admin/users">
              <q-item-section>Users</q-item-section>
            </q-item>
          </q-list>
        </q-scroll-area>
      </q-drawer>
      <q-page padding>
        <RouterView />
      </q-page>
    </q-page-container>
  </template>
</template>
