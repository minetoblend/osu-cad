<script setup lang="ts">
import { ChatMessage } from '@osucad/common';
import ChatFragment from './ChatFragment.vue';
import { useEditor } from '@/editor/editorContext.ts';
import { match } from 'variant';

const props = defineProps<{
  message: ChatMessage;
}>();

const isServer = computed(() => props.message.user === 'server');
const username = computed(() => {
  if (props.message.user === 'server') {
    return 'server';
  }
  return props.message.user.username;
});
const avatarUrl = computed(() => {
  if (props.message.user === 'server') {
    return undefined;
  }
  return props.message.user.avatarUrl;
});

const { connectedUsers } = useEditor();

const ownUserId = computed(() => connectedUsers.ownUser.value?.id);

const mentionsMe = computed(() =>
  props.message.message.some(
    (it) => it.type === 'mention' && it.mention === ownUserId.value,
  ),
);

const { clock, beatmapManager, selection } = useEditor();

function onTimestampClick(timestamp: { time: number; objects: number[] }) {
  if (isNaN(timestamp.time)) return;
  clock.seek(timestamp.time);

  selection.clear();

  let hitObjects = beatmapManager.hitObjects.hitObjects;
  const startIndex = hitObjects.findIndex(
    (it) => it.startTime >= timestamp.time,
  );
  if (startIndex === -1) return;
  hitObjects = hitObjects.slice(startIndex);
  const comboNumbers = [...timestamp.objects];
  for (const obj of hitObjects) {
    if (comboNumbers.length === 0) break;
    if (comboNumbers[0] === obj.indexInCombo + 1) {
      selection.add(obj);
      comboNumbers.shift();
    }
  }
}

const timestamp = computed(() => {
  const date = new Date(props.message.timestamp);
  const locale = navigator.language;
  return date.toLocaleString(locale, {
    hour: 'numeric',
    minute: 'numeric',
  });
});

function onUsernameClicked() {
  const user = props.message.user;
  if (user === 'server') return;
  if (user.id === ownUserId.value) return;
  const session = connectedUsers.users.value.find((it) => it.id === user.id);
  if (session) {
    const activity = session.presence.activity;
    if (activity) {
      match(activity, {
        composeScreen({ currentTime }) {
          clock.seek(currentTime);
        },
        default() {},
      });
    }
  }
}
</script>

<template>
  <q-item v-once :class="{ 'mentions-me': mentionsMe }">
    <q-item-section>
      <div class="row">
        <div class="text-bold username" :class="{ server: isServer }">
          <q-avatar class="avatar" size="28px" @click="onUsernameClicked">
            <img v-if="avatarUrl" :src="avatarUrl" />
          </q-avatar>
          {{ username }}
        </div>
        <q-space />
        <div class="text-caption">{{ timestamp }}</div>
      </div>
      <pre
        class="message-content"
      ><chat-fragment v-for="(fragment, index) in message.message"
                      :key="index"
                      :fragment="fragment"
                      :own-user-id="ownUserId"
                      @timestamp-click="onTimestampClick"
      /></pre>
    </q-item-section>
  </q-item>
</template>

<style lang="scss" scoped>
.mentions-me {
  background-color: rgba($primary, 0.1);
}

pre {
  font-family: $font-family;
  white-space: pre-wrap;
  word-break: break-word;
}

.avatar {
  margin-right: 0.5rem;
}

.username {
  cursor: pointer;

  &.server {
    color: $primary;
    user-select: none;
    cursor: default;
  }
}

.message-content {
  padding-left: calc(28px + 0.5rem);
  margin: 0;
}
</style>
