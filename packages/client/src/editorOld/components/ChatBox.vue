<script setup lang="ts">
import ChatMessage from './ChatMessage.vue';
import { useEditor } from '@/editorOld/editorContext.ts';
import ScrollArea from '@/components/common/ScrollArea.vue';
import LazyChatMessage from '@/editorOld/components/LazyChatMessage.vue';
import ChatTextBox from '@/editorOld/components/ChatTextBox.vue';

const currentMessage = ref('');

const { chat } = useEditor();

const showChat = useLocalStorage('showChat', true);

function sendMessage() {
  if (currentMessage.value.trim().length === 0) {
    return;
  }

  chat.sendMessage(currentMessage.value);
  currentMessage.value = '';
}

const chatScrollArea = ref();

watch(chat.messages, () => {
  const el = unrefElement(chatScrollArea);
  if (el) {
    nextTick(() => {
      el?.scrollTo(0, el.scrollHeight);
    });
  }
});

onMounted(() => {
  const el = unrefElement(chatScrollArea);
  if (el) {
    el.scrollTo({
      left: 0,
      top: el.scrollHeight,
      behavior: 'instant',
    });
  }
});

const messages = computed(() => {
  const messages = chat.messages;
  if (messages.length > 200) {
    return messages.slice(messages.length - 200);
  }
  return messages;
});
</script>

<template>
  <Card class="chat-box" v-if="showChat">
    <div class="p-4">
      <div class="flex">
        <div class="flex-1 font-bold text-xl flex items-center gap-2">Chat</div>
        <button
          class="bg-transparent w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-400"
          @click="showChat = false"
          v-wave
        >
          <span class="i-fas-x" />
        </button>
      </div>
    </div>

    <ScrollArea class="flex-1" ref="chatScrollArea">
      <ul>
        <LazyChatMessage v-for="message in messages" :key="message.id">
          <ChatMessage :message="message" />
        </LazyChatMessage>
      </ul>
    </ScrollArea>
    <div class="p-2">
      <ChatTextBox v-model="currentMessage" @send-message="sendMessage" />
    </div>
  </Card>
  <button
    v-else
    class="btn-gray-200 absolute right-2 bottom-25 px-6 py-4"
    @click="showChat = true"
  >
    <div class="i-fas-message" />
  </button>
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
  max-height: 65vh;
}
</style>
