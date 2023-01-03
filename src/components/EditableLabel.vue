<template>
  <div v-if="editing" class="editable-label editing">
    <input ref="input" type="text"
           v-model="localValue"
           @blur="commit"
           @keydown.enter="commit"
           @keydown.esc.prevent="editing = false">
  </div>
  <div v-else class="editable-label" @dblclick="editing = true">
    <div>
      <slot>
        {{ modelValue }}
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import {nextTick, ref} from 'vue'
import {whenever} from "@vueuse/core";
import {useEditor} from "@/editor";

const props = defineProps<{
  modelValue: string | number
  number?: boolean
  round?: boolean
  transaction?: string
}>()

const editing = ref(false)
const localValue = ref('')
const input = ref<HTMLInputElement>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
}>()

const {history} = useEditor()

function commit() {
  let value: string | number = localValue.value
  if (props.number) {
    value = parseFloat(value.replace('_', ''))

    if (props.round)
      value = Math.round(value)

    if (isNaN(value)) {
      editing.value = false
      return;
    }
  }

  if (props.transaction) {
    history.record(props.transaction, () => {
      emit('update:modelValue', value)
    })
  } else {
    emit('update:modelValue', value)
  }

  editing.value = false
}

whenever(editing, () => {
  localValue.value = props.modelValue.toString()
  nextTick(() => {
    input.value?.focus()
    input.value?.select()
  })
})
</script>

<style lang="scss">
.editable-label {
  display: flex;
  cursor: pointer;
  width: 100%;
  justify-content: stretch;

  > * {
    flex: 1;
  }

  &:not(.editing):hover {
    outline: 1px dashed rgba(255, 255, 255, 0.2);
  }

  input {
    padding: 5px;
    font-family: "Saira", sans-serif;
    display: block;
    width: 100%;
  }
}
</style>
