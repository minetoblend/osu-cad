<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useUserStore } from '@/stores/userStore.ts';

const userStore = useUserStore();
const { user } = storeToRefs(userStore);
</script>

<template>
  <ClientOnly>
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <button bg="transparent active:transparent">
          <div class="flex gap-2 items-center">
            {{ user.username }}
            <img
              v-if="user.avatarUrl"
              :src="user.avatarUrl"
              class="w-8 h-8 rounded-full"
            />
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent class="bg-gray-200 w-65" align="end">
        <DropdownMenuItem
          class="hover:bg-gray-300 cursor-pointer"
          @click="userStore.logout"
        >
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    <template #ssr-fallback>
      <button bg="transparent active:transparent">
        <div class="flex gap-2 items-center">
          {{ user.username }}
          <img
            v-if="user.avatarUrl"
            :src="user.avatarUrl"
            class="w-8 h-8 rounded-full"
          />
        </div>
      </button>
    </template>
  </ClientOnly>
</template>
