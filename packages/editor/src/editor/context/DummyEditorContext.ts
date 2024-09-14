/* eslint-disable unused-imports/no-unused-vars */
import type { PIXITexture } from 'osucad-framework';
import { Assets } from 'pixi.js';
import backgroundUrl from '../../assets/background.jpg';
import { StableBeatmapParser } from '../../beatmap/StableBeatmapParser';
import type { Beatmap } from '../../beatmap/Beatmap';
import { EditorContext } from './EditorContext';
import sampleBeatmap from './sampleBeatmap.osu?raw';

export class DummyEditorContext extends EditorContext {
  protected async loadBeatmap(): Promise<Beatmap> {
    return new StableBeatmapParser().parse(sampleBeatmap);
  }

  protected async getResource(name: string): Promise<ArrayBuffer | null> {
    return null;
  }

  loadBackground(): Promise<PIXITexture | null> {
    return Assets.load(backgroundUrl);
  }

  async updateBackground(
    file: File,
    onProgress?: ((progress: number) => void) | undefined,
  ): Promise<boolean> {
    return true;
  }
}
