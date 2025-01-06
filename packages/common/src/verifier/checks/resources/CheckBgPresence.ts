import type { IBeatmap } from '../../../beatmap/IBeatmap';
import type { CheckMetadata } from '../../BeatmapCheck';
import type { Issue } from '../../Issue';
import type { VerifierBeatmapSet } from '../../VerifierBeatmapSet';
import { GeneralCheck } from '../../GeneralCheck';
import { IssueTemplate } from '../../template/IssueTemplate';

// Ported from https://github.com/Naxesss/MapsetVerifier/blob/main/src/Checks/AllModes/General/Resources/CheckBgPresence.cs
export class CheckBgPresence extends GeneralCheck {
  override get metadata(): CheckMetadata {
    return {
      category: 'Resources',
      message: 'Missing background.',
      author: 'Naxess',
    };
  }

  override templates = {
    all: new IssueTemplate('problem', 'All difficulties are missing backgrounds.').withCause('None of the difficulties have a background present.'),
    one: new IssueTemplate('problem', '{0:beatmap} has no background.', 'difficulty').withCause('One or more difficulties are missing backgrounds, but not all.'),
    missing: new IssueTemplate('problem', '{0:beatmap} is missing its background file, "{1}".', 'difficulty', 'filename').withCause('A background file path is present, but no file exists where it is pointing.'),
  };

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
          yield this.createIssue(this.templates.missing, null, beatmap, filename);
        }
      }
    }

    if (beatmaps.length === mapset.beatmaps.length) {
      yield this.createIssue(this.templates.all, null);
    }
    else {
      for (const beatmap of beatmaps) {
        yield this.createIssue(this.templates.one, null, beatmap);
      }
    }
  }
}
