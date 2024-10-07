import {
  IBeatmap,
  IResourcesProvider,
  IResourceStore,
  LoadedBeatmap,
  StableBeatmapEncoder,
  StableBeatmapParser,
} from '@osucad/editor';
import { StableBeatmapInfo } from './StableBeatmapStore';
import { StableResourceStore } from './StableResourceStore';
import { DifficultyInfo } from '../../../../editor/src/editor/EditorBeatmap.ts';

export class StableLoadedBeatmap extends LoadedBeatmap {
  constructor(readonly osuBeatmap: StableBeatmapInfo) {
    super();
  }

  #resources!: IResourceStore<ArrayBuffer>

  get resources() {
    return this.#resources;
  }

  async load(resourcesProvider: IResourcesProvider): Promise<void> {
    const resources = await StableResourceStore.create(`osu-stable://songs?path=${encodeURIComponent(this.osuBeatmap.folderName)}&load`);

    if (!resources)
      throw new Error(`Beatmap resources not found: "${this.osuBeatmap.folderName}"`);

    this.#resources = resources;

    await super.load(resourcesProvider);
  }

  protected loadSourceBeatmap(): Promise<IBeatmap> {
    const data = this.getResource(this.osuBeatmap.osuFileName)

    if (!data)
      throw new Error(`File "${this.osuBeatmap.osuFileName}" not found in beatmap directory`)

    const contents = new TextDecoder().decode(data);

    return new StableBeatmapParser().parse(contents)
  }

  async save() {
    return await window.api.saveBeatmap(this.osuBeatmap.folderName, this.osuBeatmap.osuFileName, new StableBeatmapEncoder().encode(this.beatmap));
  }

  async getOtherDifficulties(): Promise<DifficultyInfo[]> {
    const difficulties: DifficultyInfo[] = [];

    const parser = new StableBeatmapParser()

    for (const resource of this.resources.getAvailableResources()) {
      if(resource.endsWith('.osu') && resource !== this.osuBeatmap.osuFileName) {
        const data = this.getResource(resource);
        if (!data)
          continue;

        try {
          const text = new TextDecoder().decode(data)
          const beatmap = await parser.parse(text, {
            timingPoints: false,
            hitObjects: false,
          })

          if (beatmap.metadata.difficultyName === this.beatmap.metadata.difficultyName)
            continue;

          difficulties.push({
            difficultyName: beatmap.metadata.difficultyName,
            load: () => parser.parse(text)
          })
        } catch(e) {
          console.warn(e)
        }
      }
    }

    return difficulties;
  }
}
