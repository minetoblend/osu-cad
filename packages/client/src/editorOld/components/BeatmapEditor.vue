<script setup lang="ts">
import EventList from './EventList.vue';
import UserList from './UserList.vue';
import EditorViewport from './EditorViewport.vue';
import PreferencesOverlay from '@/editorOld/components/PreferencesOverlay.vue';
import { EditorPopoverHost } from '@/editorOld/components/popover';
import ChatBox from '@/editorOld/components/ChatBox.vue';
import EditorMenubar from '@/editorOld/components/menubar/EditorMenubar.vue';
import { isMobile } from '@/utils';

const emit = defineEmits(['viewportInitialized']);

const mobile = isMobile();
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
      <ChatBox v-if="!mobile" />
      <EditorPopoverHost />
      <PreferencesOverlay />
    </div>
  </div>
</template>
