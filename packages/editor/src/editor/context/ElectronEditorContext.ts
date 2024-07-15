/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable ts/no-require-imports */

import type { Beatmap } from '@osucad/common';
import { BeatmapDecoder } from 'osu-parsers';
import { StandardRuleset } from 'osu-standard-stable';
import type { PIXITexture } from 'osucad-framework';
import { textureFrom } from 'pixi.js';
import { BeatmapConverter } from '../../beatmaps/BeatmapConverter';
import { Skin } from '../../skins/Skin';
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
    const beatmap = new BeatmapDecoder().decodeFromString(contents);
    const standardBeatmap = new StandardRuleset().applyToBeatmap(beatmap);

    return new BeatmapConverter(standardBeatmap).convert();
  }

  protected async loadSong(beatmap: Beatmap): Promise<AudioBuffer> {
    const context = new AudioContext();

    const buffer = await readFile(
      path.join(this.beatmapDirectory, beatmap.audioFilename),
    );
    const arrayBuffer = new Uint8Array(buffer).buffer;

    return context.decodeAudioData(arrayBuffer);
  }

  async loadBackground(beatmap: Beatmap): Promise<PIXITexture | null> {
    const buffer = await readFile(
      path.join(this.beatmapDirectory, beatmap.backgroundPath),
    );

    const blob = new Blob([buffer]);

    const image = await createImageBitmap(blob);

    return textureFrom({
      resource: image,
    });
  }

  protected async loadSkin(): Promise<Skin> {
    return new Skin();
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
