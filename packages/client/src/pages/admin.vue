<script setup lang="ts">
import { useCurrentUser } from '@/composables/useCurrentUser.ts';

const { isAdmin } = useCurrentUser();
</script>

<template>
  <template v-if="isAdmin">
    <q-page-container>
      <q-page padding>
        <page-layout>
          <template #left>
            <router-link to="/admin/rooms" v-slot:default="props">
              <q-btn
                no-caps
                :flat="!props.isActive"
                :color="props.isActive ? 'dark' : 'light'"
                :text-color="props.isActive ? 'primary' : 'grey-6'"
                class="full-width"
                v-bind="props"
              >
                Rooms
              </q-btn>
            </router-link>
            <router-link to="/admin/users" v-slot:default="props">
              <q-btn
                no-caps
                :flat="!props.isActive"
                :color="props.isActive ? 'dark' : 'light'"
                :text-color="props.isActive ? 'primary' : 'grey-6'"
                class="full-width"
                v-bind="props"
              >
                Users
              </q-btn>
            </router-link>
          </template>
          <RouterView />
        </page-layout>
      </q-page>
    </q-page-container>
  </template>
</template>
