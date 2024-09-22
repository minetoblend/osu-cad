import { EditorContext, loadTexture, PIXITexture, StableBeatmapParser } from '@osucad/editor';
import { Beatmap } from 'packages/editor/src/beatmap/Beatmap';
import { OsuBeatmap } from 'osu-db-parser';
import log from 'electron-log/renderer';
import { StableResourceStore } from './StableResourceStore.ts';
import { StableBeatmapEncoder } from '../../../../editor/src/beatmap/StableBeatmapEncoder.ts';
import { StableBeatmapInfo } from './StableBeatmapStore.ts';

const logger = log.create({ logId: 'ElectronEditorContext' });

export class StableEditorContext extends EditorContext {
  constructor(
    readonly osuBeatmap: StableBeatmapInfo,
  ) {
    super();
  }

  resources!: StableResourceStore;

  async load(): Promise<void> {
    const resources = await StableResourceStore.create(`osu-stable://songs?path=${encodeURIComponent(this.osuBeatmap.folderName)}&load`);

    if (!resources) {
      throw new Error(`Beatmap resources not found: "${this.osuBeatmap.folderName}"`);
    }

    this.resources = resources;

    await super.load();
  }

  protected loadBeatmap(): Promise<Beatmap> {
    const file = this.resources.get(this.osuBeatmap.osuFileName);
    if (!file) {
      throw new Error(`Beatmap not found: "${this.osuBeatmap.osuFileName}"`);
    }

    const fileContent = new TextDecoder().decode(file);

    return new StableBeatmapParser().parse(fileContent);
  }

  protected async loadBackground(beatmap: Beatmap): Promise<PIXITexture | null> {
    if (!beatmap.settings.backgroundFilename)
      return null;

    const data = this.resources.get(beatmap.settings.backgroundFilename);
    if (!data) {
      logger.warn(`Background file not found: "${beatmap.settings.backgroundFilename}"`);

      return null;
    }

    const extension = beatmap.settings.backgroundFilename.split('.').pop();
    let mimeType: string;
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        mimeType = 'image/jpeg';
        break;
      case 'png':
        mimeType = 'image/png';
        break;
      default:
        logger.warn(`Background file has unsupported extension: "${beatmap.settings.backgroundFilename}"`);
        return null;
    }

    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const texture = await loadTexture(url);

    URL.revokeObjectURL(url);

    return texture;
  }

  async save() {
    return await window.api.saveBeatmap(this.osuBeatmap.folderName, this.osuBeatmap.osuFileName, new StableBeatmapEncoder().encode(this.beatmap));
  }
}
