import { Beatmap } from "@osucad/common";
import { BeatmapDecoder } from 'osu-parsers';
import { StandardRuleset } from 'osu-standard-stable';
import { PIXITexture } from "osucad-framework";
import { textureFrom } from "pixi.js";
import { BeatmapConverter } from "../../beatmaps/BeatmapConverter";
import { Skin } from "../../skins/Skin";
import { EditorContext } from "./EditorContext";

const {readFile} = require('fs/promises')
const path = require('path')

export class ElectronEditorContext extends EditorContext {

  constructor(
    readonly path: string,
  ) {
    super();
  }

  get beatmapDirectory() {
    return path.dirname(this.path)
  }

  protected async loadBeatmap(): Promise<Beatmap> {
    const contents = await readFile(this.path, 'utf-8')
    const beatmap = new BeatmapDecoder().decodeFromString(contents)
    const standardBeatmap = new StandardRuleset().applyToBeatmap(beatmap)

    return new BeatmapConverter(standardBeatmap).convert();
  }

  // @ts-ignore - Unused method
  protected async loadSong(beatmap: Beatmap): Promise<AudioBuffer> {
    const context = new AudioContext();

    const buffer = await readFile(path.join(this.beatmapDirectory, beatmap.audioFilename))
    const arrayBuffer = new Uint8Array(buffer).buffer

    return context.decodeAudioData(arrayBuffer);
  }

  async loadBackground(beatmap: Beatmap): Promise<PIXITexture | null> {
    const buffer = await readFile(path.join(this.beatmapDirectory, beatmap.backgroundPath))

    const blob = new Blob([buffer])

    const image = await createImageBitmap(blob)

    return textureFrom({
      resource: image
    })
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
