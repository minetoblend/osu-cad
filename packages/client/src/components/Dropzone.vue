<script setup lang="ts">
import Button from './Button.vue';

defineProps<{
  accept?: string;
}>();

const emit = defineEmits<{
  (name: 'drop', files: File[]): void;
}>();

const dropzone = ref<HTMLDivElement>();
const fileInput = ref<HTMLInputElement>();

const { isOverDropZone } = useDropZone(dropzone, {
  onDrop,
});

function onDrop(files: File[] | null) {
  if (files === null) return;
  emit('drop', files);
}

function selectFile() {
  fileInput.value?.click();
}

function onInput(evt: Event) {
  const files = (evt.target as HTMLInputElement).files;
  if (files === null) return;
  onDrop(Array.from(files));
}
</script>

<template>
  <div
    ref="dropzone"
    class="b-1 b-gray-400 p-4 text-center rounded-md transition-shadow"
    :class="[isOverDropZone && 'ring ring-primary-600']"
  >
    <input
      id="osz-file"
      ref="fileInput"
      type="file"
      :accept="accept"
      style="display: none"
      @input="onInput"
    />
    <slot :select="selectFile">
      <h3>
        Drag file here or
        <Button @click="selectFile"> Select file </Button>
      </h3>
    </slot>
  </div>
</template>

<style lang="scss" scoped>
//.oc-dropzone {
//  border: 2px dashed rgba($text-color, 0.35);
//  padding: 1rem;
//  display: flex;
//  flex-direction: column;
//  align-items: center;
//  justify-content: center;
//  border-radius: 8px;
//
//  &--active {
//    border: 2px dashed $primary;
//  }
//
//  :slotted(h3) {
//    font-size: 1.25rem;
//    margin: 0;
//    line-height: unset;
//  }
//}
</style>
