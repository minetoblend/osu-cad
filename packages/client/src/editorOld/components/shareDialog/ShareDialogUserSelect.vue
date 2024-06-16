<script setup lang="ts">
import {
  ComboboxAnchor,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxRoot,
  ComboboxTrigger,
  ComboboxViewport,
} from 'radix-vue';
import { BeatmapAccess, OsuUser, UserInfo } from '@osucad/common';
import axios from 'axios';
import { useEditor } from '@/editorOld/editorContext.ts';

const props = defineProps<{
  participants: { user: UserInfo; access: BeatmapAccess }[];
}>();

const emit = defineEmits<{
  (event: 'addParticipant', user: OsuUser): void;
}>();

const searchTerm = ref('');

const debouncedSearchTerm = debouncedRef(searchTerm, 300);

const { connectedUsers } = useEditor();

const suggestedUsers = computedAsync(async () => {
  const term = debouncedSearchTerm.value.trim().toLowerCase();
  if (!term) return [];

  const response = await axios.get<OsuUser[]>(`/api/users/search`, {
    params: {
      query: term,
    },
  });

  return response.data;
}, []);

const filteredUsers = computed(() => {
  return suggestedUsers.value.filter(
    (user) =>
      !props.participants.some((p) => p.user.id === user.id) &&
      user.id !== connectedUsers.ownUser.value?.id,
  );
});

const selectedUser = ref<OsuUser>();

watchEffect(() => {
  if (selectedUser.value) {
    emit('addParticipant', selectedUser.value);
    selectedUser.value = undefined;
  }
});

const comboBoxRef = ref();
const comboBoxOpen = ref(false);
onClickOutside(comboBoxRef, () => {
  comboBoxOpen.value = false;
});
</script>

<template>
  <ComboboxRoot
    ref="comboBoxRef"
    v-model="selectedUser"
    v-model:search-term="searchTerm"
    v-model:open="comboBoxOpen"
    class="relative"
  >
    <ComboboxAnchor
      class="w-full bg-gray-300 inline-flex items-center justify-between rounded outline-none"
    >
      <ComboboxInput
        class="!bg-transparent outline-none text-grass11 w-full h-full selection:bg-grass5 placeholder-mauve8 p-2"
        placeholder="Add user"
      />
      <ComboboxTrigger class="!bg-transparent outline-none p-2" />
    </ComboboxAnchor>
    <ComboboxContent
      class="absolute z-10 w-full min-w-[160px] bg-gray300 overflow-hidden rounded will-change-[opacity,transform]"
      dismissable
    >
      <ComboboxViewport class="p-2">
        <ComboboxEmpty
          class="text-mauve8 text-xs font-medium text-center py-2"
        />

        <ComboboxItem
          v-for="option in filteredUsers"
          :key="option.id"
          class="text-[13px] leading-none text-grass11 rounded-[3px] flex items-center h-11 px-2 relative select-none data-[disabled]:pointer-events-none data-[highlighted]:outline-none data-[highlighted]:bg-gray-400 cursor-pointer"
          :value="option"
        >
          <div class="flex items-center gap-2">
            <img :src="option.avatar_url" class="w-8 h-8 rounded-full" />
            {{ option.username }}
          </div>
        </ComboboxItem>
      </ComboboxViewport>
    </ComboboxContent>
  </ComboboxRoot>
</template>
