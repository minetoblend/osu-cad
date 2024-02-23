<script setup lang="ts">
import {createEditorClient} from "../editorClient.ts";
import EventList from "./EventList.vue";
import UserList from "./UserList.vue";
import EditorViewport from "./EditorViewport.vue";
import {frameStats} from "@osucad/client/src/editor/drawables/DrawableSystem.ts";
import PreferencesOverlay from "@/editor/components/PreferencesOverlay.vue";
import {isMobile} from "@/util/isMobile.ts";
import {EditorContext} from "@/editor/editorContext.ts";
import {promiseTimeout} from "@vueuse/core";
import LoadingIcon from "@/editor/components/LoadingIcon.vue";
import gsap from "gsap";
import {animate, Easing} from "@/editor/drawables/animate.ts";
import {App} from "@capacitor/app";
import {useRouter} from "vue-router";
import {Power3} from 'gsap'
import {EditorPopoverHost} from "@/editor/components/popover";

const {beatmapId} = defineProps<{
  beatmapId: string;
}>();

const editor = shallowRef<EditorContext>()
const loadProgress = ref(0)

onMounted(async () => {
  const progress = ref(0)
  const stop = watch(progress, progress => {
    gsap.to(loadProgress, {value: progress * 0.85, duration: 0.75, ease: Power3.easeOut});
  }, {immediate: true})

  const ctx = await createEditorClient(beatmapId, progress);
  stop();
  const tween = gsap.getTweensOf(loadProgress)[0]
  if (tween && tween.isActive()) {
    await tween
  }

  editor.value = ctx

  await until(viewportInitialized).toBeTruthy()

  await promiseTimeout(100)

  requestAnimationFrame(() => {
    gsap.to(loadProgress, {value: 2.5, duration: 1})
  })
})

const router = useRouter()

App.addListener('backButton', () => {
  router.replace('/')
})

const mobile = isMobile();

const loadingOpacity = computed(() => animate(loadProgress.value, 2, 2.5, 1, 0, Easing.inQuad))

const viewportInitialized = ref(false)

</script>

<template>

  <div class="beatmap-editor">
    <template v-if="editor">
      <EditorViewport id="viewport" @initialized="viewportInitialized = true"/>
      <EditorPopoverHost/>
      <!--    <EditorToolbar id="toolbar"/>-->
      <!--z    <div class="banner">-->
      <!--      Currently making changes (trying to add hitsounds), expect frequent reloads and freezes.-->
      <!--      <div>Ping me on discord if the reloads are becoming too annoying</div>-->
      <!--    </div>-->
      <EventList id="event-list"/>
      <UserList id="user-list"/>
      <Teleport to="#navbar-content">
        <button style="margin-right: 1rem" @click="editor.commandManager.undo()">
          Undo
        </button>
        <button style="margin-right: 1rem" @click="editor.commandManager.redo()">
          Redo
        </button>
        <a style="margin-right: 1rem" @click="editor.commandManager.redo()" href="https://discord.gg/JYFTaYDSC6"
           target="_blank">Report a bug</a>
        <a class="button" style="margin-right: 1rem" @click="editor.commandManager.redo()"
           :href="`/api/mapsets/${editor.beatmapManager.beatmap.setId}/export`" target="_blank">Export as .osz</a>
        <!--      <button @click="editor.socket.emit('roll')">Roll</button>-->
      </Teleport>
    </template>

    <div id="loading-icon" v-if="loadProgress < 2.5" :style="{ opacity: loadingOpacity }">
      <div>
        <LoadingIcon :progress="loadProgress"/>
        <QLinearProgress :value="loadProgress" color="primary" rounded instant-feedback size="6px" />
      </div>
    </div>
  </div>

  <PreferencesOverlay/>
</template>

<style lang="scss" scoped>
.beatmap-editor {
  position: relative;
  height: 100%;
  //overflow: hidden;
  overflow: clip;
  user-select: none;
}

@media (max-width: 1024px) {
  .beatmap-editor {
    //height: calc(100vh - 48px);
  }
}

#loading-icon {
  position: absolute;
  inset: 0;
  z-index: 100;
  background: $surface-0;

  display: flex;
  justify-content: center;
  align-items: center;
}

#viewport {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

#toolbar {
  position: absolute;
  top: 0;
  left: 0;
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
  bottom: 3rem;
  right: 1rem;
  text-align: right;
  font-size: 1.5rem;
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
