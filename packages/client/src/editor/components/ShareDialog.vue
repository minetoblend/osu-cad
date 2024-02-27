<script setup lang="ts">
import { BeatmapAccess, BeatmapInfo, OsuUser, UserInfo } from '@osucad/common';
import Button from '@/components/Button.vue';
import { QSelect, useDialogPluginComponent } from 'quasar';
import CopyButton from '@/components/CopyButton.vue';
import axios from 'axios';
import { promiseTimeout } from '@vueuse/core';
import { useEditor } from '@/editor/editorContext.ts';

const props = defineProps<{
  beatmap: BeatmapInfo;
  access: BeatmapAccess;
  participants: { user: UserInfo; access: BeatmapAccess }[];
}>();

const editor = useEditor();

const { dialogRef, onDialogHide } = useDialogPluginComponent();

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

const selectedUsers = ref<OsuUser[]>([]);
const suggestedUsers = ref<OsuUser[]>([]);
watch(selectedUsers, () => {
  suggestedUsers.value = [];
  userSelect.value?.updateInputValue('', true);
});

async function filterFn(
  term: string,
  update: (fn: () => void) => void,
  abort: () => void,
) {
  term = term.trim().toLowerCase();
  if (term.length < 2) {
    suggestedUsers.value = [];
    update(() => {});
    return;
  }

  try {
    const response = await axios.get<OsuUser[]>(`/api/users/search`, {
      params: {
        query: term,
      },
    });

    update(() => {
      suggestedUsers.value = response.data.filter(filterUser);
    });
  } catch (e) {
    console.error(e);
    abort();
  }
}

function abortFilterFn() {
  suggestedUsers.value = [];
}

const userSelect = ref<QSelect>();

function filterUser(user: { id: number }) {
  if (selectedUsers.value.some((u) => u.id === user.id)) return false;
  if (participants.value.some((p) => p.user.id === user.id)) return false;
  if (editor.connectedUsers.ownUser.value?.id === user.id) return false;

  return true;
}

async function updateParticipants(users: number[], access: BeatmapAccess) {
  isSaving.value = true;
  saveType.value = 'participants';
  try {
    const [response] = await Promise.all([
      axios.post(`/api/beatmaps/${props.beatmap.id}/participants/add`, {
        users,
        access,
      }),
      promiseTimeout(300),
    ]);

    participants.value = response.data.participants;
  } catch (e) {
    console.error(e);
  } finally {
    isSaving.value = false;
  }
}
</script>

<template>
  <q-dialog ref="dialogRef">
    <div class="share-dialog" :class="{ saving: isSaving }">
      <q-card flat>
        <q-card-section>
          <div class="row items-center q-pb-md">
            <div class="text-h6">Share beatmap</div>
          </div>
          <div class="q-pb-md row no-wrap items-start">
            <q-select
              :model-value="null"
              filled
              use-input
              :options="suggestedUsers"
              option-label="username"
              option-value="id"
              lazy-rules
              label="Add user"
              new-value-mode="add-unique"
              dense
              ref="userSelect"
              class="full-width"
              @update:modelValue="
                $event && updateParticipants([$event.id], BeatmapAccess.View)
              "
              @filter="filterFn"
              @filter-abort="abortFilterFn"
            >
              <template #option="{ opt, itemProps }">
                <q-item v-bind="itemProps">
                  <q-item-section avatar>
                    <q-avatar>
                      <img :src="opt.avatar_url" />
                    </q-avatar>
                  </q-item-section>
                  <q-item-section>{{ opt.username }}</q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>
          <q-separator />
          <div>
            <q-list separator>
              <q-item
                v-for="participant in participants"
                :key="participant.user.id"
                class="q-px-none"
              >
                <q-item-section avatar>
                  <q-avatar v-if="participant.user.avatarUrl">
                    <img :src="participant.user.avatarUrl" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  {{ participant.user.username }}
                </q-item-section>
                <q-item-section side>
                  <div class="row items-center">
                    <ButtonGroup>
                      <Button
                        v-for="level in accessLevels"
                        :key="level.value"
                        :outline="participant.access !== level.value"
                        @click="
                          updateParticipants([participant.user.id], level.value)
                        "
                      >
                        {{ level.label }}
                      </Button>
                    </ButtonGroup>

                    <q-btn
                      class="q-ml-md"
                      icon="close"
                      flat
                      round
                      dense
                      color="danger"
                      @click="
                        updateParticipants(
                          [participant.user.id],
                          BeatmapAccess.None,
                        )
                      "
                    />
                  </div>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
          <q-inner-loading :show="isSaving && saveType === 'participants'" />
        </q-card-section>
      </q-card>
      <q-card
        flat
        style="width: 500px; max-width: 500px"
        :class="{ saving: isSaving }"
      >
        <q-card-section>
          <div class="text-h6">Public link sharing</div>
          <div class="row items-center q-pb-md">
            <q-toggle v-model="linkSharingEnabled" />
            <div
              v-if="isSaving && saveType === 'linkSharingEnabled'"
              class="q-px-md"
            >
              <q-spinner size="20px" />
            </div>
            <template v-else>
              Link-sharing is {{ linkSharingEnabled ? 'enabled' : 'disabled' }}
            </template>
          </div>
          <template v-if="linkSharingEnabled">
            <div class="link-section q-pb-md">
              <div class="row items-center">
                <span class="link-url">{{ shareUrl }}</span>
                <CopyButton :value="shareUrl" />
              </div>
            </div>
            <div class="row items-center q-pb-md">
              Anyone with the link can
              <q-space />
              <div
                v-if="isSaving && saveType === 'accessLevel'"
                class="q-px-md"
              >
                <q-spinner size="20px" />
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
          <div class="row justify-content-end">
            <Button @click="onDialogHide">Done</Button>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-dialog>
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
</style>
