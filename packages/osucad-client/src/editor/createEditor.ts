import { HitObjectSelectionManager } from "./selection";
import { EditorClock } from "./clock";
import {
  BeatmapColors,
  BeatmapColorsFactory,
  BeatmapDifficulty,
  BeatmapDifficultyFactory,
  BetamapMetadata,
  BetamapMetadataFactory,
  CircleFactory,
  ControlPointListFactory,
  HitObjectCollection,
  HitObjectCollectionFactory,
  SliderFactory,
  TimingPointCollection,
  TimingPointCollectionFactory,
  TimingPointFactory,
} from "@osucad/common";
import { UnisonClient } from "@osucad/unison-client";
import { tokenProvider } from "./tokenProvider";
import { useConnectedUsers } from "./connectedUsers";
import { loadAudio } from "./sound";
import { createInjectionState } from "@vueuse/core";
import { onUnmounted } from "vue";
import { useRoute } from "vue-router";
import { getEditorPreferences } from "./preferences";
import { createShortcutListener } from "@/composables/shortcuts";
import { applyHitObjectDefaults } from "./applyHitObjectDefaults";
import { trackHitObjectStacking } from "./stackManager";

export async function createEditor(documentId: string) {
  onUnmounted(() => {
    container.disconnect();
  });

  const route = useRoute();

  const shortcuts = createShortcutListener();

  const client = new UnisonClient(
    "http://10.25.120.192:3000/editor",
    tokenProvider
  );

  const container = await client.connect<{
    metadata: BetamapMetadata;
    timing: TimingPointCollection;
    hitObjects: HitObjectCollection;
    difficulty: BeatmapDifficulty;
    colors: BeatmapColors;
  }>(documentId, [
    new TimingPointFactory(),
    new TimingPointCollectionFactory(),
    new BetamapMetadataFactory(),
    new BeatmapDifficultyFactory(),
    new HitObjectCollectionFactory(),
    new CircleFactory(),
    new SliderFactory(),
    new BeatmapColorsFactory(),
    new ControlPointListFactory(),
  ]);

  const preferences = await getEditorPreferences();

  const { songAudio } = await loadAudio(container);

  const clock = new EditorClock(container, songAudio, route);
  const users = useConnectedUsers(
    container.users,
    container.signals,
    container.connection
  );

  const selection = new HitObjectSelectionManager(container);

  applyHitObjectDefaults(
    container.document.objects.hitObjects,
    container.document.objects.difficulty,
    container.document.objects.timing
  );

  // trackHitObjectStacking(
  //   container.document.objects.hitObjects,
  //   container.document.objects.difficulty
  // );

  return {
    container,
    users,
    clock,
    timing: container.document.objects.timing,
    hitObjects: container.document.objects.hitObjects,
    difficulty: container.document.objects.difficulty,
    colors: container.document.objects.colors,
    selection,
    preferences,
  };
}

export const [provideEditor, useEditor] = createInjectionState(
  (editor: Awaited<ReturnType<typeof createEditor>>) => editor
);

export type EditorInstance = Awaited<ReturnType<typeof createEditor>>;
