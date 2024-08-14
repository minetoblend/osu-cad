/* eslint-disable unused-imports/no-unused-vars */
import type { Beatmap } from '@osucad/common';
import type { PIXITexture } from 'osucad-framework';
import { Assets } from 'pixi.js';
import { BeatmapDecoder } from 'osu-parsers';
import { StandardRuleset } from 'osu-standard-stable';
import audioUrl from '../../assets/audio.mp3';
import backgroundUrl from '../../assets/background.jpg';
import { Skin } from '../../skins/Skin';
import { BeatmapConverter } from '../../beatmap/BeatmapConverter';
import { EditorContext } from './EditorContext';
import sampleBeatmap from './sampleBeatmap.osu?raw';

export class DummyEditorContext extends EditorContext {
  protected async loadBeatmap(): Promise<Beatmap> {
    const beatmap = new BeatmapDecoder().decodeFromString(sampleBeatmap);
    const standardBeatmap = new StandardRuleset().applyToBeatmap(beatmap);

    return new BeatmapConverter(standardBeatmap).convert();
  }

  protected loadSong(): Promise<AudioBuffer> {
    const context = new AudioContext();

    return fetch(audioUrl)
      .then(response => response.arrayBuffer())
      .then(buffer => context.decodeAudioData(buffer));
  }

  loadBackground(): Promise<PIXITexture | null> {
    return Assets.load(backgroundUrl);
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
