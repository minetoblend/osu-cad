<script setup lang="ts">
import { BeatmapInfo } from '@osucad/common';
import axios from 'axios';

const props = defineProps<{
  beatmap: BeatmapInfo;
  eager?: boolean;
}>();

const emit = defineEmits<{
  (event: 'delete', beatmap: BeatmapInfo): void;
}>();

async function deleteBeatmap() {
  await axios.delete(`/api/beatmaps/${props.beatmap.id}`, {
    withCredentials: true,
  });
  emit('delete', props.beatmap);
}
</script>

<template>
  <RouterLink
    :to="beatmap.links.edit"
    class="bg-gray-300 rounded overflow-hidden flex group relative"
  >
    <div
      class="w-30 h-30 rounded overflow-hidden bg-gray-400 shadow-right shrink-0 relative"
    >
      <img
        v-if="beatmap.links.thumbnail"
        :src="beatmap.links.thumbnail"
        :alt="beatmap.title"
        class="cover-parent"
        :loading="eager ? 'eager' : 'lazy'"
      />
    </div>
    <div class="flex grow shrink flex-col px-3 py-2 relative min-w-0" v-wave>
      <div class="flex-1 min-w-0">
        <div class="flex gap-2">
          <div class="flex-1 grow shrink font-500 truncate min-w-0">
            {{ beatmap.title }}
          </div>
          <div class="flex gap-2">
            {{ beatmap.creator.username }}
            <img
              :src="beatmap.creator.avatarUrl!"
              class="w-6 h-6 rounded-full"
              alt=""
            />
          </div>
        </div>
        <div class="font-400 text-4">
          {{ beatmap.artist }}
        </div>
      </div>
      <div class="grow" />
      <div class="flex items-end justify-between">
        <div class="bg-primary-600 px-2 rounded">{{ beatmap.version }}</div>
        <div class="">
          <ClientOnly v-if="beatmap.isOwner">
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <button
                  class="p-1 rounded"
                  bg="transparent active:transparent hover:gray-400"
                  @pointerdown.stop
                  @click.stop
                >
                  <div class="flex gap-2 items-center">
                    <div class="i-fas-ellipsis" />
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent class="bg-gray-400 w-50" align="end">
                <DropdownMenuItem
                  class="hover:bg-gray-500 cursor-pointer"
                  @click="deleteBeatmap"
                >
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </ClientOnly>
        </div>
      </div>
    </div>
  </RouterLink>
</template>
