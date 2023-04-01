<script setup lang="ts">
import {computed, onBeforeUnmount, reactive, ref} from "vue";
import {useContainer} from "@/composables/useContainer";
import {IClient, ISignalMessage, IUser} from "@osucad/unison";
import {watchThrottled} from "@vueuse/core";
import {useInputSelection} from "@/composables/useCursorPos";

const props = defineProps<{
  id: string;
  modelValue: string | number;
  badge?: boolean;
  modelModifiers?: { number?: boolean; int?: boolean };
  lazy?: boolean;
}>();

const emit = defineEmits<{
  (ev: "update:modelValue", value: string | number): void;
}>();

const text = computed({
  get: () => props.modelValue,
  set: (value) => {
    if (props.modelModifiers?.int) {
      value = parseInt(value.toString());
      if (isNaN(value)) return;
    } else if (props.modelModifiers?.number) {
      value = parseFloat(value.toString());
      if (isNaN(value)) return;
    }

    emit("update:modelValue", value);
  },
});

const { signals, users } = useContainer()!;

interface IEditingUser {
  clientId: string;
  user: IUser;
  data: any;
  selection: {
    start: number;
    end: number;
  };
}

const editingUsers = reactive<IEditingUser[]>([]);

const isFocused = ref(false);

const handleSignal = (data: any, message: ISignalMessage) => {
  const { id, start, end } = data;
  if (message.client.clientId === users.me.clientId) return;

  if (id === props.id) {
    const client = message.client;
    const index = editingUsers.findIndex((c) => c.clientId === client.clientId);

    if (typeof start === "number") {
      if (index === -1) {
        editingUsers.push({
          clientId: client.clientId,
          data: client.data,
          user: client.user,
          selection: {
            start,
            end,
          },
        });
      } else {
        editingUsers[index].selection = {
          start,
          end,
        };
      }
    } else if (index !== -1) editingUsers.splice(index, 1);
  }
};

const onUserLeft = (client: IClient) => {
  const index = editingUsers.findIndex((c) => c.clientId === client.clientId);
  if (index !== -1) editingUsers.splice(index, 1);
};

signals.on("textCursor", handleSignal);
users.on("userLeft", onUserLeft);

onBeforeUnmount(() => {
  users.off("userLeft", onUserLeft);
  signals.off("textCursor", handleSignal);
});

const outlineStyle = computed(() => {
  if (isFocused.value) {
    return {
      outline: "2px solid white",
    };
  } else if (editingUsers.length > 0) {
    const editingUser = editingUsers[editingUsers.length - 1];
    return {
      outline: "2px solid " + editingUser.data.color,
    };
  }
});

const editingUser = computed(() => {
  if (editingUsers.length > 0) {
    return editingUsers[editingUsers.length - 1];
  }
});

const input = ref<HTMLInputElement>();
const selection = useInputSelection(input);

watchThrottled(
  [selection.start, selection.end],
  ([start, end]) => {
    signals.emit("textCursor", {
      id: props.id,
      start,
      end,
    });
  },
  { deep: true, throttle: 100 }
);

const cursors = computed(() =>
  editingUsers.map((user) => {
    const { start, end } = user.selection;
    const { x } = getCursorXY(input.value!, start);

    if (end !== start) {
      const { x: x2 } = getCursorXY(input.value!, end);
      return {
        id: user.clientId,
        style: {
          left: x + "px",
          backgroundColor: user.data.color,
          width: x2 - x + "px",
          opacity: 0.35,
        },
      };
    }

    return {
      id: user.clientId,
      style: {
        left: x + "px",
        backgroundColor: user.data.color,
      },
    };
  })
);

const getCursorXY = (input: HTMLInputElement, selectionPoint: number) => {
  const { offsetLeft: inputX, offsetTop: inputY } = input;
  // create a dummy element that will be a clone of our input
  const div = document.createElement("div");
  // get the computed style of the input and clone it onto the dummy element
  const copyStyle = getComputedStyle(input) as any;

  for (const prop of copyStyle) {
    div.style[prop] = copyStyle[prop];
  }
  // we need a character that will replace whitespace when filling our dummy element if it's a single line <input/>
  const swap = ".";
  const inputValue = props.modelValue;
  // set the div content to that of the textarea up until selection
  const textContent = inputValue.toString().substr(0, selectionPoint);
  // set the text content of the dummy element div
  div.textContent = textContent;

  if (input.tagName === "TEXTAREA") div.style.height = "auto";
  // if a single line input then the div needs to be single line and not break out like a text area
  if (input.tagName === "INPUT") div.style.width = "auto";
  // create a marker element to obtain caret position
  const span = document.createElement("span");
  // give the span the textContent of remaining content so that the recreated dummy element is as close as possible
  span.textContent = inputValue.toString().substr(selectionPoint) || ".";
  // append the span marker to the div
  div.appendChild(span);
  // append the dummy element to the body
  document.body.appendChild(div);
  // get the marker position, this is the caret position top and left relative to the input
  const { offsetLeft: spanX, offsetTop: spanY } = span;

  // lastly, remove that dummy element
  // NOTE:: can comment this out for debugging purposes if you want to see where that span is rendered
  document.body.removeChild(div);
  // return an object with the x and y of the caret. account for input positioning so that you don't need to wrap the input
  return {
    x: spanX,
    y: spanY,
  };
};

function onBlur() {
  input.value!.value = text.value.toString()
}

function onInput() {
  if(!props.lazy)
  text.value = input.value!.value
}

function onChange() {
  if(props.lazy)
  text.value = input.value!.value
}

</script>

<template>
  <div class="text-input" :style="outlineStyle">
    <input ref="input" :value="text" @input="onInput" @change="onChange" @blur="onBlur" />
    <div class="cursor-container">
      <div
        class="cursor"
        v-for="cursor in cursors"
        :key="cursor.id"
        :style="cursor.style"
      />
    </div>
    <template v-if="badge">
      <Transition>
        <div v-if="editingUser" class="user-badge">
          <div class="display-name" :style="{ color: editingUser.data.color }">
            {{ editingUser.user.name }}
          </div>
          <div class="avatar">
            <img :src="editingUser.data.avatarUrl" />
          </div>
        </div>
      </Transition>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.text-input {
  border-radius: 2px;
  background-color: rgba(white, 0.1);
  position: relative;

  input {
    border: none;
    outline: none;
    padding: 0.35rem 0.35rem;
    background-color: transparent;
    font-size: 1rem;
    position: relative;
    color: inherit;
    width: 100%;
    box-sizing: border-box;

    &:focus {
      outline: none;
    }
  }

  .cursor-container {
    position: absolute;
    top: 0rem;
    bottom: 0rem;
    left: 0;
    right: 0;
    pointer-events: none;

    .cursor {
      position: absolute;
      width: 2px;
      height: 1.5rem;
      top: 0.25rem;
      background-color: white;
      animation: blink 1s infinite;

      transition: left 0.1s ease-out, width 0.1s ease-out, opacity 0.1s ease-out;
    }
  }

  .user-badge {
    position: absolute;
    top: 0;
    right: 0;
    border-radius: 50%;
    transform: translate(0, -100%);
    display: flex;
    gap: 4px;
    align-items: center;
    padding-bottom: 2px;

    .avatar {
      width: 20px;
      height: 20px;
      border-radius: 4px;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;

        object-fit: cover;
      }
    }

    .display-name {
      color: white;
      margin-left: 0.25rem;
      margin-top: 0.25rem;
    }

    &.v-enter-active,
    &.v-leave-active {
      transition: transform 0.2s ease-out, opacity 0.2s ease-out;
    }

    &.v-enter-from,
    &.v-leave-to {
      opacity: 0;
      transform: translate(0, -70%);
    }
  }
}
</style>
