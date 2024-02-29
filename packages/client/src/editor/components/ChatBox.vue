<script setup lang="ts">
import ChatMessage from './ChatMessage.vue';
import { useEditor } from '@/editor/editorContext.ts';
import { QScrollArea } from 'quasar';

const currentMessage = ref('');

const { chat } = useEditor();

const showChat = useLocalStorage('showChat', true);

function sendMessage(evt: KeyboardEvent) {
  if (evt.shiftKey) return;

  chat.sendMessage(currentMessage.value);

  currentMessage.value = '';
  evt.preventDefault();
}

const chatScrollArea = ref<QScrollArea | null>(null);

watch(chat.messages, () => {
  const el = chatScrollArea.value as QScrollArea;
  if (el) {
    nextTick(() => {
      el.setScrollPercentage('vertical', 100);
    });
  }
});

onMounted(() => {
  const el = chatScrollArea.value as QScrollArea;
  if (el) {
    el.setScrollPercentage('vertical', 100);
  }
});
</script>

<template>
  <q-card class="chat-box" flat v-if="showChat">
    <q-card-section>
      <div class="row">
        <div class="text-h6">
          <q-icon icon="chat" />
          Chat
        </div>
        <q-space />
        <q-btn icon="close" flat round dense @click="showChat = false" />
      </div>
    </q-card-section>

    <q-scroll-area class="chat-messages" ref="chatScrollArea">
      <q-list>
        <chat-message
          v-for="message in chat.messages"
          :key="message.id"
          :message="message"
        />
      </q-list>
    </q-scroll-area>
    <div class="row">
      <q-input
        v-model="currentMessage"
        dense
        class="flex-1"
        filled
        type="textarea"
        autogrow
        :maxlength="500"
        @keydown.enter="sendMessage"
      />
    </div>
  </q-card>
  <q-btn
    class="chat-button"
    v-else
    color="dark"
    icon="chat"
    @click="showChat = true"
  />
</template>

<style lang="scss" scoped>
.chat-box {
  width: 350px;
  position: absolute;
  right: 5px;
  display: flex;
  flex-direction: column;
  height: 400px;
  bottom: 90px;
}

.chat-button {
  position: absolute;
  right: 5px;
  bottom: 90px;
}

.chat-messages {
  flex: 1;
}
</style>
