/* eslint-disable ts/no-require-imports */

import type { PIXITexture } from 'osucad-framework';
import { textureFrom } from 'pixi.js';
import { Skin } from '../../skins/Skin';
import { StableBeatmapParser } from '../../beatmap/StableBeatmapParser';
import type { Beatmap } from '../../beatmap/Beatmap';
import { EditorContext } from './EditorContext';

const { readFile } = require('node:fs/promises');
const path = require('node:path');

export class ElectronEditorContext extends EditorContext {
  constructor(readonly path: string) {
    super();
  }

  get beatmapDirectory() {
    return path.dirname(this.path);
  }

  protected async loadBeatmap(): Promise<Beatmap> {
    const contents = await readFile(this.path, 'utf-8');

    const parser = new StableBeatmapParser();

    const beatmap = await parser.parse(contents);

    console.log(beatmap);

    return beatmap;
  }

  protected async loadSong(beatmap: Beatmap): Promise<AudioBuffer> {
    const context = new AudioContext();

    const buffer = await readFile(
      path.join(this.beatmapDirectory, beatmap.settings.audioFilename),
    );
    const arrayBuffer = new Uint8Array(buffer).buffer;

    return context.decodeAudioData(arrayBuffer);
  }

  async loadBackground(beatmap: Beatmap): Promise<PIXITexture | null> {
    if (beatmap.settings.backgroundFilename === null)
      return null;

    const buffer = await readFile(
      path.join(this.beatmapDirectory, beatmap.settings.backgroundFilename),
    );

    const blob = new Blob([buffer]);

    const image = await createImageBitmap(blob);

    return textureFrom({
      resource: image,
    });
  }

  protected async loadSkin(): Promise<Skin> {
    const skin = new Skin();

    await skin.load();

    return skin;
  }

  async updateSong(
    file: File,
    onProgress?: ((progress: number) => void) | undefined,
  ): Promise<boolean> {
    return true;
  }

  async updateBackground(
    file: File,
    onProgress?: ((progress: number) => void) | undefined,
  ): Promise<boolean> {
    return true;
  }
}
