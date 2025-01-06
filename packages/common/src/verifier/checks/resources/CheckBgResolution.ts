import type { CheckMetadata } from '../../BeatmapCheck';
import type { Issue } from '../../Issue';
import type { VerifierBeatmapSet } from '../../VerifierBeatmapSet';
import { loadTexture } from 'osucad-framework';
import { GeneralCheck } from '../../GeneralCheck';

// Ported from https://github.com/Naxesss/MapsetVerifier/blob/main/src/Checks/AllModes/General/Resources/CheckBgResolution.cs
export class CheckBgResolution extends GeneralCheck {
  override get metadata(): CheckMetadata {
    return {
      category: 'Resources',
      message: 'Too high or low background resolution.',
      author: 'Naxess',
    };
  }

  override async * getIssues(mapset: VerifierBeatmapSet): AsyncGenerator<Issue, void, undefined> {
    const bgFilenames = new Set<string>();
    for (const beatmap of mapset.beatmaps) {
      const filename = beatmap.settings.backgroundFilename?.trim() ?? '';
      if (filename.length === 0)
        continue;

      bgFilenames.add(filename);
    }

    const issues: Issue[] = [];

    await Promise.all([...bgFilenames].map(async (filename) => {
      const file = mapset.fileStore.getFile(filename);
      if (!file)
        return;

      const data = await file.getData();

      const megaBytes = data.byteLength / 1024 ** 2;

      if (megaBytes > 2.5) {
        issues.push(this.createIssue({
          level: 'problem',
          message: `"${filename}" has a size exceeding 2.5MB (${megaBytes.toFixed(1)}MB)`,
          cause: 'A background file has a file size greater than 2.5 MB.',
        }));
      }

      const texture = await loadTexture(data);
      if (!texture)
        return;

      if (texture.width > 2560 || texture.height > 1440) {
        issues.push(this.createIssue({
          level: 'problem',
          message: `"${filename}" greater than 2560 x 1440 (${texture.width} x ${texture.height})`,
          cause: 'A background file has a width exceeding 2560 pixels or a height exceeding 1440 pixels.',
        }));
      }

      if (texture.width < 1024 || texture.height < 640) {
        issues.push(this.createIssue({
          level: 'problem',
          message: `"${filename}" smaller than than 1024 x 640 (${texture.width} x ${texture.height})`,
          cause: 'A background file has a width lower than 1024 pixels or a height lower than 640 pixels.',
        }));
      }
    }));

    yield * issues;
  }
}
