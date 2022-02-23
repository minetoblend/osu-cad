<template>
  <div class="home">
    <input type="file" accept=".mp3" @input="uploadMp3"/>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {httpClient} from "@/common-http";

export default defineComponent({
  name: 'Home',
  components: {},
  setup() {
    async function uploadMp3(evt: Event) {
      const formData = new FormData()
      formData.append('file', (evt.target as HTMLInputElement).files!.item(0)!)

      await httpClient.post('/beatmap/mp3', formData)
    }

    return {
      uploadMp3
    }
  }
});
</script>
