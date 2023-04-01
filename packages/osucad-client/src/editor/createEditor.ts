import {HitObjectSelectionManager} from "./selection";
import {EditorClock} from "./clock";
import {
    BeatmapColors,
    BeatmapColorsFactory,
    BeatmapDifficulty,
    BeatmapDifficultyFactory,
    BetamapMetadata,
    BetamapMetadataFactory,
    CircleFactory,
    HitObjectCollection,
    HitObjectCollectionFactory,
    TimingPointCollection,
    TimingPointCollectionFactory,
    TimingPointFactory,
} from "@osucad/common";
import {UnisonClient} from "@osucad/unison-client";
import {tokenProvider} from "./tokenProvider";
import {useConnectedUsers} from "./connectedUsers";
import {loadAudio} from "./sound";
import {createInjectionState} from "@vueuse/core";
import {onUnmounted} from "vue";
import {useRoute} from "vue-router";
import {getEditorPreferences} from "./preferences";

export async function createEditor(documentId: string) {
  onUnmounted(() => {
    container.disconnect();
  });

  const route = useRoute();

  const client = new UnisonClient(
    "https://api.osucad.com/editor",
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
    new BeatmapColorsFactory(),
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
