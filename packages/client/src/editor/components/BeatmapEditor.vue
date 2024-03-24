<script setup lang="ts">
import EventList from './EventList.vue';
import UserList from './UserList.vue';
import EditorViewport from './EditorViewport.vue';
import PreferencesOverlay from '@/editor/components/PreferencesOverlay.vue';
import { EditorPopoverHost } from '@/editor/components/popover';
import ChatBox from '@/editor/components/ChatBox.vue';
import EditorMenubar from '@/editor/components/menubar/EditorMenubar.vue';

const emit = defineEmits(['viewportInitialized']);
</script>

<template>
  <div class="w-screen h-screen flex flex-col overflow-clip">
    <EditorMenubar class="h-10 b-b b-gray-300" />
    <div class="flex-1 relative">
      <EditorViewport
        class="absolute inset-0"
        @initialized="emit('viewportInitialized')"
      />
      <EventList class="absolute top-4 left-16" />
      <UserList class="absolute top-4 right-4" />
      <ChatBox />
      <EditorPopoverHost />
      <PreferencesOverlay />
    </div>
  </div>
</template>
