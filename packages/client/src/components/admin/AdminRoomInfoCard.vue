<script setup lang="ts">
import { RoomInfo, BeatmapAccess } from '@osucad/common';

const props = defineProps<{ room: RoomInfo }>();

function translateAccess(access: BeatmapAccess) {
  switch (access) {
    case BeatmapAccess.None:
      return 'None';
    case BeatmapAccess.View:
      return 'View';
    case BeatmapAccess.Modding:
      return 'Modding';
    case BeatmapAccess.Edit:
      return 'Edit';
    case BeatmapAccess.MapsetOwner:
      return 'Mapset Owner';
  }
}

const formattedRoomAge = useTimeAgo(() => new Date(props.room.createdAt));
</script>

<template>
  <q-card flat>
    <q-card-section>
      <div class="q-mb-md">
        <div class="row">
          <q-avatar v-if="room.beatmap.links.thumbnail" rounded class="q-mr-md">
            <img :src="room.beatmap.links.thumbnail.href" />
          </q-avatar>
          <div class="flex-grow-1">
            <div class="row">
              <div class="text-h6">
                {{ room.mapset.artist }} - {{ room.mapset.title }}
                <a :href="room.beatmap.links.edit.href" target="_blank">
                  <q-icon name="open_in_new" />
                </a>
              </div>
              <q-space />
              <div class="text-caption">Started {{ formattedRoomAge }} ago</div>
            </div>
            <div class="text-subtitle2">
              {{ room.beatmap.name }}
            </div>
          </div>
        </div>
      </div>
      <div class="grid">
        <div class="col-4">
          <q-list>
            <transition-group name="user">
              <q-item v-for="user in room.users" :key="user.sessionId">
                <q-item-section>
                  <div class="row items-center">
                    <q-avatar
                      v-if="user.avatarUrl"
                      rounded
                      size="25px"
                      class="q-mr-md"
                    >
                      <img :src="user.avatarUrl" />
                    </q-avatar>
                    <div>
                      <div>
                        {{ user.username }}
                      </div>
                      <div class="text-primary">
                        {{ translateAccess(user.access) }}
                      </div>
                    </div>
                  </div>
                </q-item-section>
              </q-item>
            </transition-group>
          </q-list>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>
