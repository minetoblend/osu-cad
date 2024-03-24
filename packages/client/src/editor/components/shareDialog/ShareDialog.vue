<script setup lang="ts">
import { BeatmapAccess, BeatmapInfo, OsuUser, UserInfo } from '@osucad/common';
import axios from 'axios';
import { promiseTimeout } from '@vueuse/core';
import { useEditor } from '@/editor/editorContext.ts';
import {
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogClose,
} from 'radix-vue';
import ShareDialogUserSelect from '@/editor/components/shareDialog/ShareDialogUserSelect.vue';

const props = defineProps<{
  beatmap: BeatmapInfo;
  access: BeatmapAccess;
  participants: { user: UserInfo; access: BeatmapAccess }[];
}>();

const editor = useEditor();

const shareUrl = `${window.location.origin}${props.beatmap.links.edit}`;

const accessLevel = ref(props.access);

const participants = ref(props.participants);

const linkSharingEnabled = computed({
  get: () => accessLevel.value !== BeatmapAccess.None,
  set: (value: boolean) => {
    setAccessLevel(
      value ? BeatmapAccess.View : BeatmapAccess.None,
      'linkSharingEnabled',
    );
  },
});

const isSaving = ref(false);
const saveType = ref<'accessLevel' | 'linkSharingEnabled' | 'participants'>();

async function setAccessLevel(
  access: BeatmapAccess,
  type: 'accessLevel' | 'linkSharingEnabled',
) {
  try {
    isSaving.value = true;
    saveType.value = type;

    const [response] = await Promise.all([
      axios.put<{ access: BeatmapAccess }>(
        `/api/beatmaps/${props.beatmap.id}/access`,
        {
          access,
        },
      ),
      promiseTimeout(300),
    ]);

    accessLevel.value = response.data.access;
  } catch (e) {
    console.error(e);
  } finally {
    isSaving.value = false;
  }
}

const accessLevels = [
  {
    label: 'View',
    value: BeatmapAccess.View,
  },
  {
    label: 'Edit',
    value: BeatmapAccess.Edit,
  },
];

async function updateParticipants(users: number[], access: BeatmapAccess) {
  isSaving.value = true;
  saveType.value = 'participants';
  try {
    const [response] = await Promise.all([
      axios.post(`/api/beatmaps/${props.beatmap.id}/participants/add`, {
        users,
        access,
      }),
    ]);

    participants.value = response.data.participants;
  } catch (e) {
    console.error(e);
  } finally {
    isSaving.value = false;
  }
}

function addParticipant(user: OsuUser) {
  console.log('addParticipant', user);
  updateParticipants([user.id], BeatmapAccess.View);
}
</script>

<template>
  <DialogContent
    class="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[600px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-gray-200 p-[25px] shadow-xl focus:outline-none z-[100]"
  >
    <DialogTitle class="text-xl">Share beatmap</DialogTitle>
    <DialogDescription>
      <ShareDialogUserSelect
        class="mt-2"
        :participants="participants"
        @add-participant="addParticipant"
      />
      <div class="mt-2">
        <div
          v-for="participant in participants"
          :key="participant.user.id"
          class="flex items-center py-2 b-t b-gray-300"
        >
          <img
            :src="participant.user.avatarUrl!"
            alt=""
            class="w-8 h-8 rounded-full mr-2"
          />
          {{ participant.user.username }}
          <div class="flex-1" />
          <ButtonGroup>
            <Button
              v-for="level in accessLevels"
              :key="level.value"
              :outline="participant.access !== level.value"
              @click="updateParticipants([participant.user.id], level.value)"
              v-wave
            >
              {{ level.label }}
            </Button>
          </ButtonGroup>
          <button
            class="bg-transparent p-2 rounded"
            v-wave
            @click="
              updateParticipants([participant.user.id], BeatmapAccess.None)
            "
          >
            <div class="i-fas-x" />
          </button>
        </div>
      </div>
      <div class="mt-6 pt-6 b-t b-gray-500">
        <div class="text-xl">Public link sharing</div>
        <div class="flex items-center mt-4 gap-2">
          <Switch v-model="linkSharingEnabled" />
          <div
            v-if="isSaving && saveType === 'linkSharingEnabled'"
            class="q-px-md"
          >
            <div class="i-fas-spinner spin" size="20px" />
          </div>
          <template v-else>
            Link-sharing is {{ linkSharingEnabled ? 'enabled' : 'disabled' }}
          </template>
        </div>
        <template v-if="linkSharingEnabled">
          <div class="link-section my-4">
            <div class="flex items-center">
              <span class="link-url">{{ shareUrl }}</span>
              <CopyButton :value="shareUrl" />
            </div>
          </div>
          <div class="flex items-center pb-4">
            Anyone with the link can
            <div class="flex-1" />
            <div v-if="isSaving && saveType === 'accessLevel'" class="px-4">
              <div class="i-fas-spinner spin" size="20px" />
            </div>
            <div>
              <ButtonGroup>
                <Button
                  v-for="level in accessLevels"
                  :key="level.value"
                  :outline="accessLevel !== level.value"
                  @click="setAccessLevel(level.value, 'accessLevel')"
                >
                  {{ level.label }}
                </Button>
              </ButtonGroup>
            </div>
          </div>
        </template>
      </div>
      <div class="flex justify-end">
        <DialogClose class="btn-gray-400">Done</DialogClose>
      </div>
    </DialogDescription>
  </DialogContent>
</template>

<style lang="scss" scoped>
.share-dialog {
  width: 500px;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;

  > * {
    width: 100%;
  }
}

.link-url {
  padding: 8px;
  color: $primary;
  background-color: rgba($primary, 0.1);
  flex-grow: 1;
  margin-right: 1rem;
  border-radius: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.copy-button {
  min-width: 100px;
}

.saving {
  pointer-events: none;
  filter: brightness(0.8);
}

:deep(.col) {
  padding: 0;
}

:deep(.inline) {
  display: inline-flex !important;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
