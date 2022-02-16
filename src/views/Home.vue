<template>
  <div class="home">
    <editor/>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import PlayField from "@/components/PlayField.vue";
import Editor from "@/components/Editor.vue";

export default defineComponent({
  name: 'Home',
  components: {
    Editor,
    PlayField,
  },
});
</script>
