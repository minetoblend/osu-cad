import type { Beatmap } from '../Beatmap';
import type { FileStore } from '../io/FileStore';
import type { IFile } from '../io/IFile';

export abstract class WorkingBeatmapSet {
  protected constructor(
    readonly beatmaps: ReadonlyArray<Beatmap>,
    readonly fileStore: FileStore,
  ) {
  }

  get files(): ReadonlyArray<IFile> {
    return this.fileStore.files;
  }

  getFile(filename: string): IFile | null {
    return this.fileStore.getFile(filename);
  }

  get metadata() {
    return this.beatmaps[0].metadata;
  }

  getBackgroundImageFile(): IFile | null {
    for (const beatmap of this.beatmaps) {
      if (!beatmap.settings.backgroundFilename?.trim()?.length)
        continue;

      const file = this.getFile(beatmap.settings.backgroundFilename);
      if (file)
        return file;
    }

    return null;
  }

  getAudioFile(): IFile | null {
    for (const beatmap of this.beatmaps) {
      const file = this.getFile(beatmap.settings.audioFileName);
      if (file)
        return file;
    }

    return null;
  }
}
