import { Beatmap, defaultHitSoundLayers, hitObjectId } from "@osucad/common";
import { PIXITexture } from "osucad-framework";
import { Assets } from "pixi.js";
import audioUrl from "../../assets/audio.mp3";
import backgroundUrl from "../../assets/background.jpg";
import { Skin } from "../../skins/Skin";
import { EditorContext } from "./EditorContext";

export class DummyEditorContext extends EditorContext {
  protected async loadBeatmap(): Promise<Beatmap> {
    return new Beatmap({
      id: "",
      setId: "",
      name: "Dummy Beatmap",
      metadata: {
        artist: "",
        title: "",
        beatmapId: 0,
        beatmapSetId: 0,
        tags: "",
      },
      audioFilename: "",
      backgroundPath: "",
      bookmarks: [],
      colors: [],
      controlPoints: {
        controlPoints: [
          {
            id: hitObjectId(),
            time: 100,
            timing: {
              beatLength: 60_000 / 180,
            },
            velocityMultiplier: 1,
          },
        ],
      },
      difficulty: {
        circleSize: 4,
        hpDrainRate: 5,
        overallDifficulty: 5,
        sliderMultiplier: 1.4,
        sliderTickRate: 1,
        approachRate: 9,
      },
      general: {
        stackLeniency: 0.7,
      },
      hitObjects: [],
      hitSounds: {
        layers: defaultHitSoundLayers(),
      },
    });
  }

  // @ts-ignore - Unused method
  protected loadSong(beatmap: Beatmap): Promise<AudioBuffer> {
    const context = new AudioContext();

    return fetch(audioUrl)
      .then((response) => response.arrayBuffer())
      .then((buffer) => context.decodeAudioData(buffer));
  }

  loadBackground(): Promise<PIXITexture | null> {
    return Assets.load(backgroundUrl);
  }

  protected async loadSkin(): Promise<Skin> {
    return new Skin();
  }

  async updateSong(
    // @ts-ignore - Unused method
    file: File,
    // @ts-ignore - Unused method
    onProgress?: ((progress: number) => void) | undefined
  ): Promise<boolean> {
    return true;
  }

  async updateBackground(
    // @ts-ignore - Unused method
    file: File,
    // @ts-ignore - Unused method
    onProgress?: ((progress: number) => void) | undefined
  ): Promise<boolean> {
    return true;
  }
}
