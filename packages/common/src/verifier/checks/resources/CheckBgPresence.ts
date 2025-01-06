import type { IBeatmap } from '../../../beatmap/IBeatmap';
import type { CheckMetadata } from '../../BeatmapCheck';
import type { Issue } from '../../Issue';
import type { VerifierBeatmapSet } from '../../VerifierBeatmapSet';
import { GeneralCheck } from '../../GeneralCheck';

// Ported from https://github.com/Naxesss/MapsetVerifier/blob/main/src/Checks/AllModes/General/Resources/CheckBgPresence.cs
export class CheckBgPresence extends GeneralCheck {
  override get metadata(): CheckMetadata {
    return {
      category: 'Resources',
      message: 'Missing background.',
      author: 'Naxess',
    };
  }

  override async * getIssues(mapset: VerifierBeatmapSet): AsyncGenerator<Issue, void, undefined> {
    const beatmaps: IBeatmap[] = [];

    for (const beatmap of mapset.beatmaps) {
      const filename = beatmap.settings.backgroundFilename?.trim() ?? '';
      if (filename.length === 0) {
        beatmaps.push(beatmap);
      }
      else {
        const file = mapset.fileStore.getFile(filename);
        if (!file) {
          yield this.createIssue({
            level: 'problem',
            message: `"${beatmap.metadata.difficultyName}" is missing it's background file, "${filename}".`,
            cause: 'A background file path is present, but no file exists where it is pointing.',
          });
        }
      }
    }

    if (beatmaps.length === mapset.beatmaps.length) {
      yield this.createIssue({
        level: 'problem',
        message: `All difficulties are missing backgrounds.`,
        cause: 'None of the difficulties have a background present.',
      });
    }
    else {
      for (const beatmap of beatmaps) {
        yield this.createIssue({
          level: 'problem',
          message: `"${beatmap.metadata.difficultyName}" has no background.`,
          cause: 'One or more difficulties are missing backgrounds, but not all.',
        });
      }
    }
  }
}
