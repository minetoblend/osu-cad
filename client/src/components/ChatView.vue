<template>
  <div class="chat-view" v-if="channel">
    <n-scrollbar class="messages" ref="scrollBar" @wheel.stop>
      <n-list>
        <n-list-item v-for="message in messages" :key="message.message_id">
          <b>{{ message.username }}</b>: <span class="message-content">{{ message.content.message }}</span>
        </n-list-item>
      </n-list>
    </n-scrollbar>

    <n-input-group>
      <n-input type="text" v-model:value="message" @keydown.enter="sendMessage" placeholder="Chat"/>
      <n-button type="primary" ghost @click="sendMessage">Send</n-button>
    </n-input-group>
  </div>
</template>

<script setup lang="ts">

import {nextTick, PropType, reactive, ref, shallowRef} from "vue";
import {Channel, Client, Socket} from "@heroiclabs/nakama-js";
import {Session} from "@heroiclabs/nakama-js/session";
import {ChannelMessage} from "@heroiclabs/nakama-js/dist/socket";
import {ScrollbarInst} from "naive-ui/es/scrollbar/src/Scrollbar";

const props = defineProps({
  client: {
    type: Object as PropType<Client>,
    required: true
  },
  socket: {
    type: Object as PropType<Socket>,
    required: true
  },
  session: {
    type: Object as PropType<Session>,
    required: true
  },
  roomName: {
    type: String,
    required: true
  }
})

const roomName = props.roomName
const persistence = false
const hidden = false
const channel = shallowRef<Channel>()

const messages = reactive<ChannelMessage[]>([])
const scrollBar = ref<ScrollbarInst>()

async function init() {
  channel.value = await props.socket.joinChat(roomName, 1, persistence, hidden)

  props.socket.onchannelmessage = (channelMessage: ChannelMessage) => {
    messages.push(channelMessage);

    nextTick(() => {
      const scrollHeight = (scrollBar.value as any).scrollbarInstRef.contentRef?.scrollHeight ?? 0
      scrollBar.value?.scrollTo({top: scrollHeight, behavior: 'smooth'})
    })
  }
}


async function sendMessage() {

  if (message.value.trim().length <= 0)
    return;

  const messageAck = await props.socket.writeChatMessage(
      channel.value!.id,
      {message: message.value}
  )


  message.value = ""
}


let cursor: string | undefined

const message = ref('')

init()

</script>

<style lang="scss">
.chat-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 100%;

  .messages {
    flex-grow: 1;
    flex-shrink: 1;

    .message-content {
      user-select: text;
    }
  }
}
</style>