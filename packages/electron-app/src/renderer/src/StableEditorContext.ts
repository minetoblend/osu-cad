import { EditorContext, loadTexture, PIXITexture, StableBeatmapParser, Track } from '@osucad/editor';
import { Beatmap } from 'packages/editor/src/beatmap/Beatmap';
import log from 'electron-log/renderer';
import { StableResourceStore } from './StableResourceStore.ts';
import { StableBeatmapEncoder } from '../../../../editor/src/beatmap/StableBeatmapEncoder.ts';
import { StableBeatmapInfo } from './StableBeatmapStore.ts';
import { join } from 'path';
import { IResourcesProvider } from '../../../../editor/src/io/IResourcesProvider.ts';
import { OsucadSettings } from '../../../../editor/src/config/OsucadSettings.ts';

const logger = log.create({ logId: 'ElectronEditorContext' });

export class StableEditorContext extends EditorContext {
  constructor(
    resourcesProvider: IResourcesProvider,
    readonly osuBeatmap: StableBeatmapInfo,
  ) {
    super(resourcesProvider);
  }

  resources!: StableResourceStore;

  async load(): Promise<void> {
    console.log('loading resources');

    const resources = await StableResourceStore.create(`osu-stable://songs?path=${encodeURIComponent(this.osuBeatmap.folderName)}&load`);

    if (!resources)
      throw new Error(`Beatmap resources not found: "${this.osuBeatmap.folderName}"`);

    console.log(`loaded resources, found ${resources.getAvailableResources().length} entries`);

    this.resources = resources;

    await super.load();
  }

  protected loadBeatmap(): Promise<Beatmap> {
    console.log('loading beatmap');
    const file = this.resources.get(this.osuBeatmap.osuFileName);
    if (!file) {
      throw new Error(`Beatmap not found: "${this.osuBeatmap.osuFileName}"`);
    }

    const fileContent = new TextDecoder().decode(file);

    const beatmap = new StableBeatmapParser().parse(fileContent);

    console.log('loaded beatmap');

    return beatmap;
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

  protected async loadSong(beatmap: Beatmap): Promise<Track> {
    if (this.resourcesProvider.config.get(OsucadSettings.UseAudioStreaming)) {
      const mixer = this.resourcesProvider.mixer;

      return this.resourcesProvider.audioManager.createStreamedTrackFromUrl(mixer.music, `osu-stable://songs?path=${encodeURIComponent(join(this.osuBeatmap.folderName, this.beatmap.settings.audioFileName))}`);
    }

    return super.loadSong(beatmap);
  }
}
