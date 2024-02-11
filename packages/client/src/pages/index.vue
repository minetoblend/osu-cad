<script setup lang="ts">
import axios from "axios";
import {MapsetInfo} from "@osucad/common";
import MapsetCard from "@/components/beatmap/MapsetCard.vue";
import ImportOszCard from "../components/beatmap/ImportOszCard.vue";
import {useCurrentUser} from "../composables/useCurrentUser.ts";

const {state: mapsets} = useAsyncState<MapsetInfo[]>(() => axios.get("/api/mapsets/own").then(res => res.data), []);

watchEffect(() => {
  console.log(mapsets.value);
})

const {user} = useCurrentUser();

function onImported(mapset: MapsetInfo) {
  mapsets.value = [mapset, ...mapsets.value];
}

</script>

<template>
  <div class="page">
    <div class="mapsets">
      <ImportOszCard @imported="onImported" v-if="user"/>
      <template v-for="mapset in mapsets" :key="mapset.id">
        <MapsetCard :mapset="mapset"/>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.page {
  max-width: 960px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}

.mapsets {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
}
</style>