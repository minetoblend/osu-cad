<template>
  <div class="home">
    <div>
      <input type="file" accept=".mp3" @input="uploadMp3">
    </div>
    <template v-if="sets !== undefined">
      <h3 v-if="sets.length === 0">No avaiable beatmaps</h3>

      <dl v-for="set in sets">
        <dt>{{set.title || 'No title'}} / {{set.artist || 'No artist'}}</dt>
        <dd>
          <ul v-for="beatmap in set.beatmaps">
            <li>
              <router-link :to="`/edit/${beatmap.id}`">
                {{ beatmap.diffName || 'No diffname set' }}
              </router-link>
            </li>
          </ul>
        </dd>
      </dl>
    </template>
  </div>
</template>

<script lang="ts">
import {defineComponent, ref} from 'vue';
import {httpClient} from "@/common-http";
import {useRouter} from 'vue-router'

export default defineComponent({
  name: 'Home',
  components: {},

  setup() {
    const router = useRouter()
    const sets = ref<any[]>()
    async function uploadMp3(evt: Event) {
      const formData = new FormData()
      formData.append('file', (evt.target as HTMLInputElement).files!.item(0)!)

      const response = await httpClient.post('/beatmap/mp3', formData)
      console.log(response.data)
      if(response.data.createdBeatmap) {
        router.push(`/edit/${response.data.createdBeatmap}`)
      }
    }

    httpClient.get('/beatmap').then(res =>
      sets.value = res.data
    )

    return {
      uploadMp3,
      sets
    }
  }
});
</script>


<style lang="scss">
.home {
  width: 100vw;
  height: 100vh;
  background-color: $gray-100;
  padding: 10px;
}
</style>