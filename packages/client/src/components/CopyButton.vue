<script setup lang="ts">
import Button from '@/components/Button.vue';

defineProps<{
  value: string;
}>();

const {
  isSupported: copySupported,
  copy,
  copied,
} = useClipboard({
  copiedDuring: 5000,
});
</script>

<template>
  <Button v-if="copySupported" class="copy-button" @click="copy(value)">
    <template v-if="!copied">
      <q-icon name="content_copy" />
      Copy
    </template>
    <template v-else>
      <q-icon name="check" />
      Copied
    </template>
  </Button>
</template>
