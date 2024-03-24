<script setup lang="ts">
import { MenubarRoot } from 'radix-vue';
import FileMenu from '@/editor/components/menubar/menus/FileMenu.vue';
import EditMenu from '@/editor/components/menubar/menus/EditMenu.vue';
import HelpMenu from '@/editor/components/menubar/menus/HelpMenu.vue';
import ShareButton from '@/editor/components/shareDialog/ShareButton.vue';

const currentMenu = ref('');
</script>

<template>
  <MenubarRoot
    v-model="currentMenu"
    class="flex bg-gray-200 b-bottom b-gray-300 p-2 shadow items-center"
  >
    <FileMenu />
    <EditMenu />
    <HelpMenu />
    <div class="flex-1" />
    <ShareButton />
  </MenubarRoot>
</template>
