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
  <Button
    v-if="copySupported"
    class="flex items-center gap-2 min-w-25"
    @click="copy(value)"
  >
    <template v-if="!copied">
      <div class="i-fas-copy" name="content_copy" />
      Copy
    </template>
    <template v-else>
      <div class="i-fas-check" />
      Copied
    </template>
  </Button>
</template>
