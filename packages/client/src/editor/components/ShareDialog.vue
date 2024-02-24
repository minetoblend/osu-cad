<script setup lang="ts">
import { BeatmapAccess, BeatmapInfo } from '@osucad/common';
import Button from '@/components/Button.vue';
import { useDialogPluginComponent } from 'quasar';
import CopyButton from '@/components/CopyButton.vue';
import axios from 'axios';
import { promiseTimeout } from '@vueuse/core';

const props = defineProps<{
  beatmap: BeatmapInfo;
  access: BeatmapAccess;
}>();

const { dialogRef, onDialogHide } = useDialogPluginComponent();

const shareUrl = `${window.location.origin}${props.beatmap.links.edit.href}`;

const accessLevel = ref(props.access);

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
const saveType = ref<'accessLevel' | 'linkSharingEnabled'>();

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
</script>

<template>
  <q-dialog ref="dialogRef">
    <q-card
      flat
      style="width: 500px; max-width: 500px"
      :class="{ saving: isSaving }"
    >
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Share beatmap</div>
        <q-space />
      </q-card-section>

      <q-card-section>
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
            <div v-if="isSaving && saveType === 'accessLevel'" class="q-px-md">
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
  </q-dialog>
</template>

<style lang="scss" scoped>
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
</style>
