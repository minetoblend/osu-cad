<script setup lang="ts">
import {createEditorClient, provideEditor} from "../editorClient.ts";
import EventList from "./EventList.vue";
import UserList from "./UserList.vue";
import EditorViewport from "./EditorViewport.vue";
import {frameStats} from "@osucad/client/src/editor/drawables/DrawableSystem.ts";

const { beatmapId } = defineProps<{
  beatmapId: number;
}>();

const editor = await createEditorClient(beatmapId);

provideEditor(editor);
</script>

<template>
  <div class="beatmap-editor">
    <EditorViewport id="viewport"/>
<!--    <div class="banner">-->
<!--      Currently making changes (trying to add hitsounds), expect frequent reloads and freezes.-->
<!--      <div>Ping me on discord if the reloads are becoming too annoying</div>-->
<!--    </div>-->
    <EventList id="event-list"/>
    <UserList id="user-list"/>
<!--    <div class="frame-stats">-->
<!--      <div class="fps">{{ frameStats.fps }}fps</div>-->
<!--      <div class="frame-time">{{ (frameStats.frameTime.toFixed(1)) }}ms</div>-->
<!--    </div>-->
    <Teleport to="#navbar-content">
      <button style="margin-right: 1rem" @click="editor.commandManager.undo()">Undo</button>
      <button style="margin-right: 1rem" @click="editor.commandManager.redo()">Redo</button>
      <a style="margin-right: 1rem" @click="editor.commandManager.redo()" href="https://discord.gg/JYFTaYDSC6" target="_blank">Report a bug</a>
      <a class="button" style="margin-right: 1rem" @click="editor.commandManager.redo()" :href="`/api/mapsets/${editor.beatmapManager.beatmap.setId}/export`" target="_blank">Export as .osz</a>
<!--      <button @click="editor.socket.emit('roll')">Roll</button>-->
    </Teleport>

  </div>
</template>

<style lang="scss" scoped>
.beatmap-editor {
  position: relative;
  height: calc(100vh - 64px);
  //overflow: hidden;
  overflow: clip;
  user-select: none;
}

#viewport {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

#user-list {
  position: absolute;
  top: 1rem;
  right: 1rem;
}

#event-list {
  position: absolute;
  top: 1rem;
  left: 4rem;
}

button {
  appearance: none;
  background-color: $primary;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;

  &:hover {
    background-color: lighten($primary, 10%);
  }

  &:active {
    background-color: darken($primary, 10%);
    transform: scale(0.95);
  }
}

.frame-stats {
  position: absolute;
  bottom: 7rem;
  right: 1rem;
  text-align: right;
  font-size: 2.5rem;
}

.banner {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 1.5em;
}
</style>
