<script setup lang="ts">
import { useConnectedUsers } from '@/editorOld/connectedUsers';
import UserAvatar from '@/components/UserAvatar.vue';
import { UserSessionInfo } from '@osucad/common';
import { match } from 'variant';
import { useEditor } from '@/editorOld/editorContext.ts';
import { BeatmapAccess } from '@osucad/common';

const { users, ownUser, kick } = useConnectedUsers();
const { clock } = useEditor();

const activeUser = ref<number | null>(null);
const dropdown = ref();

const isOwner = computed(
  () => ownUser.value && ownUser.value.access >= BeatmapAccess.MapsetOwner,
);

onClickOutside(dropdown, () => {
  activeUser.value = null;
});

function setActiveUser(user: UserSessionInfo) {
  if (ownUser.value?.sessionId !== user.sessionId) {
    activeUser.value = user.sessionId;
  }
}

function goToUserTime(user: UserSessionInfo) {
  if (user.presence.activity) {
    match(user.presence.activity!, {
      composeScreen: ({ currentTime }) => {
        clock.seek(currentTime);
      },
      default() {},
    });
  }
}
</script>

<template>
  <div class="oc-userlist">
    <div
      v-for="user in users"
      :key="user.sessionId"
      class="user"
      @click="goToUserTime(user)"
      @dblclick="setActiveUser(user)"
      @contextmenu.prevent="setActiveUser(user)"
    >
      <UserAvatar :id="user.id" style="margin-right: 0.5rem" />
      {{ user.username }}
      <div
        v-if="activeUser === user.sessionId"
        ref="dropdown"
        class="user-dropdown"
      >
        <button
          v-if="clock.spectatingUser?.sessionId != user.sessionId"
          @click="clock.spectate(user)"
        >
          Spectate
        </button>
        <button v-else @click="clock.stopSpectating()">Stop spectating</button>
        <button
          v-if="isOwner && ownUser?.id !== user.id"
          @click="kick(user.id)"
        >
          Kick
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.user {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  position: relative;
  width: fit-content;
  cursor: pointer;
  user-select: none;

  .user-dropdown {
    background: $surface-100;
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    position: absolute;
    right: 100%;
    top: 0;
    overflow: clip;

    button {
      background: none;
      border: none;
      padding: 0.5rem;
      cursor: pointer;
      white-space: nowrap;

      &:hover {
        background: lighten($surface-100, 10%);
      }
    }
  }
}
</style>
