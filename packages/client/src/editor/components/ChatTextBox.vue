<script setup lang="ts">
import { useEditor } from '@/editor/editorContext.ts';
import { BeatmapAccess } from '@osucad/common';

const props = defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  (name: 'update:modelValue', value: string): void;
  (name: 'sendMessage'): void;
}>();

const currentMessage = useVModel(props, 'modelValue');

const commands = computed(() => {
  const commands = [
    {
      command: '!help',
      description: 'Show a list of commands',
    },
    {
      command: '!whisper',
      description: 'Send a private message to a user',
    },
    {
      command: '!roll',
      description: 'Roll a dice',
    },
  ];

  if (connectedUsers.ownUser.value!.access >= BeatmapAccess.MapsetOwner) {
    commands.push(
      {
        command: '!kick',
        description: 'Kick a user',
      },
      {
        command: '!purge',
        description: 'Delete last [n] messages',
      },
    );
  }

  return commands;
});

const input = ref();

const { connectedUsers } = useEditor();

const refresh = ref(0);

const autoCompletions = computed(() => {
  refresh.value;

  const completions: {
    key: string;
    highlight: string;
    remaining: string;
    insertIndex?: number;
    image?: string | null;
    description?: string;
  }[] = [];

  if (currentMessage.value.startsWith('!')) {
    for (const { command, description } of commands.value) {
      if (command.startsWith(currentMessage.value)) {
        completions.push({
          key: command,
          highlight: currentMessage.value,
          remaining: command.slice(currentMessage.value.length),
          description,
        });
      }
    }
  }

  const el = unrefElement(input) as HTMLInputElement;

  const users = new Set<string>();

  if (el && el.selectionStart) {
    const caret = el.selectionStart;
    const lastAt = currentMessage.value.lastIndexOf('@', caret - 1);
    if (lastAt !== -1) {
      const username = currentMessage.value.slice(lastAt + 1, caret);

      for (const user of connectedUsers.users.value) {
        if (users.has(user.username)) continue;
        users.add(user.username);

        if (user.username.toLowerCase().startsWith(username.toLowerCase())) {
          completions.push({
            key: '@' + user.username,
            highlight: '@' + user.username.slice(0, username.length),
            remaining: user.username.slice(username.length),
            insertIndex: lastAt,
            image: user.avatarUrl,
          });
        }
      }
    }
  }

  return completions.reverse();
});

const highlightedCompletion = ref();

const onUpKey = () => {
  if (highlightedCompletion.value === undefined) {
    highlightedCompletion.value = autoCompletions.value.length - 1;
  } else {
    highlightedCompletion.value =
      (highlightedCompletion.value - 1 + autoCompletions.value.length) %
      autoCompletions.value.length;
  }
};

const onDownKey = () => {
  if (highlightedCompletion.value === undefined) {
    highlightedCompletion.value = 0;
  } else {
    highlightedCompletion.value =
      (highlightedCompletion.value + 1) % autoCompletions.value.length;
  }
};

const onEnter = (evt: KeyboardEvent) => {
  if (evt.shiftKey) return;
  evt.preventDefault();
  if (highlightedCompletion.value !== undefined) {
    const { insertIndex, key, highlight } =
      autoCompletions.value[highlightedCompletion.value];
    const matches = key.toLowerCase() === highlight.toLowerCase();

    if (insertIndex !== undefined) {
      currentMessage.value =
        currentMessage.value.slice(0, insertIndex) +
        key +
        currentMessage.value.slice(insertIndex + highlight.length);
    } else {
      currentMessage.value = key;
    }

    nextTick(() => refresh.value++);

    if (!matches) return;
  }
  emit('sendMessage');
};

const onTab = (evt: KeyboardEvent) => {
  evt.preventDefault();
  if (highlightedCompletion.value !== undefined) {
    const { insertIndex, key, highlight } =
      autoCompletions.value[highlightedCompletion.value];
    if (insertIndex !== undefined) {
      currentMessage.value =
        currentMessage.value.slice(0, insertIndex) +
        key +
        currentMessage.value.slice(insertIndex + highlight.length);
    } else {
      currentMessage.value = key;
    }
    nextTick(() => refresh.value++);
  }
};

watch(autoCompletions, (completions, previous) => {
  if (completions.length === 0) {
    highlightedCompletion.value = undefined;
    return;
  }

  if (highlightedCompletion.value !== undefined) {
    const oldKey = previous[highlightedCompletion.value]?.key;
    const index = completions.findIndex(
      (completion) => completion.key === oldKey,
    );
    if (index !== -1) {
      highlightedCompletion.value = index;
      return;
    }
  }

  highlightedCompletion.value = completions.length - 1;
});
</script>

<template>
  <div class="relative">
    <div v-if="autoCompletions.length > 0" class="absolute bottom-full w-full">
      <div class="mb-1 bg-gray-400 rounded overflow-hidden">
        <ul>
          <li
            v-for="(completion, index) of autoCompletions"
            :key="completion.key"
            class="p-2 flex items-center"
            :class="[
              index === highlightedCompletion && 'bg-primary-600 bg-opacity-10',
            ]"
          >
            <span class="text-primary-600">{{ completion.highlight }}</span
            >{{ completion.remaining }}
            <span v-if="completion.description" class="ml-2 text-gray-600">
              {{ completion.description }}
            </span>
            <div class="flex-1" />
            <img
              v-if="completion.image"
              :src="completion.image"
              class="w-6 h-6 rounded-full"
              :alt="completion.key"
            />
          </li>
        </ul>
      </div>
    </div>
    <TextInput
      v-model="currentMessage"
      dense
      class="flex-1"
      filled
      type="textarea"
      autogrow
      :maxlength="500"
      ref="input"
      @keydown.up="onUpKey"
      @keydown.down="onDownKey"
      @keydown.enter="onEnter"
      @keydown.tab="onTab"
    />
  </div>
</template>
