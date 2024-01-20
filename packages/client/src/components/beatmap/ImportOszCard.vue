<script setup lang="ts">
import Dropzone from "../Dropzone.vue";
import ProgressBar from "../ProgressBar.vue";
import axios from "axios";
import Button from "../Button.vue";
import {MapsetInfo} from "@osucad/common";

const status = ref<"idle" | "uploading" | "processing" | "done">("idle");
const uploadProgress = ref(0);

const emit = defineEmits<{
  (name: "imported", mapset: MapsetInfo): void;
}>();

async function onDrop(files: File[]) {
  if (files.length === 0) return;

  const formData = new FormData();
  formData.append("file", files[0]);

  status.value = "uploading";
  const response = await axios.post<MapsetInfo>("/api/mapsets/import", formData, {
    withCredentials: true,
    onUploadProgress: (e) => {
      uploadProgress.value = Math.round((e.loaded * 100) / e.total!);
      if (e.loaded === e.total) {
        status.value = "processing";
      }
    },
  });
  status.value = "done";

  emit("imported", response.data);
}

watchEffect(() => {
  console.log(status.value);
});

</script>

<template>
  <Dropzone accept=".osz" @drop="onDrop">
    <template #default="{select}">
      <template v-if="status === 'idle'">
        <h3>Drag .osz file here or
          <Button @click="select">Select file</Button>
        </h3>
      </template>
      <template v-else-if="status === 'uploading'">
        <h3>Uploading</h3>
        <ProgressBar :progress="uploadProgress"/>
      </template>
    </template>
  </Dropzone>
</template>