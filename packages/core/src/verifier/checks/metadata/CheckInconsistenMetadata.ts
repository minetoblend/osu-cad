import type { IBeatmap } from '../../../beatmap/IBeatmap';
import type { CheckMetadata } from '../../BeatmapCheck';
import type { Issue } from '../../Issue';
import type { VerifierBeatmapSet } from '../../VerifierBeatmapSet';
import { trimIndent } from '../../../utils/stringUtils';
import { GeneralCheck } from '../../GeneralCheck';
import { IssueTemplate } from '../../template/IssueTemplate';

// Ported from https://github.com/Naxesss/MapsetVerifier/blob/main/src/Checks/AllModes/General/Metadata/CheckInconsistentMetadata.cs
export class CheckInconsistenMetadata extends GeneralCheck {
  override get metadata(): CheckMetadata {
    return {
      category: 'Metadata',
      message: 'Inconsistent metadata.',
      author: 'Naxess',
      documentation: [
        {
          title: 'Purpose',
          description: trimIndent(`
              Keeping metadata consistent between all difficulties of a beatmapset.
              <image>
                  https://i.imgur.com/ojdxg6z.png
                  Comparing two difficulties with different titles in a beatmapset.
              </image>
          `),
        },
        {
          title: 'Reasoning',
          description: trimIndent(`
              Since all difficulties are of the same song, they should use the same song metadata. The website also assumes it's all the
              same, so it'll only display one of the artists, titles, creators, etc. Multiple metadata simply isn't supported very well,
              and should really just be a global beatmap setting rather than a .osu-specific one.
          `),
        },
      ],
    };
  }

  override templates = {
    tags: new IssueTemplate('problem', 'Inconsistent tags between {0} and {1}, difference being "{2}".', 'difficulty', 'difficulty', 'difference').withCause('A tag is present in one difficulty but missing in another.' + '<note>Does not care which order the tags are written in or about duplicate tags, ' + 'simply that the tags themselves are consistent.</note>'),
    otherField: new IssueTemplate('problem', 'Inconsistent {0} fields between {1} and {2}; "{3}" and "{4}" respectively.', 'field', 'difficulty', 'difficulty', 'field', 'field').withCause('A metadata field is not consistent between all difficulties.'),
  };

  override async * getIssues(mapset: VerifierBeatmapSet): AsyncGenerator<Issue, void, undefined> {
    const refBeatmap = mapset.beatmaps[0];
    const refVersion = refBeatmap.beatmapInfo.difficultyName;
    const refSettings = refBeatmap.metadata;

    for (const beatmap of mapset.beatmaps) {
      const curVersion = beatmap.beatmapInfo.difficultyName;

      yield * this.getInconsistency('artist', beatmap, refBeatmap, otherBeatmap => otherBeatmap.metadata.artist);

      yield * this.getInconsistency('unicode artist', beatmap, refBeatmap, otherBeatmap => otherBeatmap.metadata.artistUnicode);

      yield * this.getInconsistency('title', beatmap, refBeatmap, otherBeatmap => otherBeatmap.metadata.title);

      yield * this.getInconsistency('unicode title', beatmap, refBeatmap, otherBeatmap => otherBeatmap.metadata.titleUnicode);

      yield * this.getInconsistency('source', beatmap, refBeatmap, otherBeatmap => otherBeatmap.metadata.source);

      yield * this.getInconsistency('creator', beatmap, refBeatmap, otherBeatmap => otherBeatmap.metadata.creator);

      if (beatmap.metadata.tags === refSettings.tags)
        continue;

      const refTags = new Set(refSettings.tags.split(' '));
      const curTags = new Set(beatmap.metadata.tags.split(' '));

      const differenceTags = refTags.difference(curTags);

      const difference = [...differenceTags].join(' ');

      if (difference !== '') {
        yield this.createIssue(this.templates.tags, null, beatmap.beatmapInfo.difficultyName, refVersion, difference);
      }
    }
  }

  /// <summary> Returns issues where the metadata fields of the given beatmaps do not match. </summary>
  * getInconsistency(fieldName: string, beatmap: IBeatmap, otherBeatmap: IBeatmap, metadataField: (beatmap: IBeatmap) => string | null | undefined) {
    const field = metadataField(beatmap);
    const otherField = metadataField(otherBeatmap);

    if ((field ?? '') !== (otherField ?? '')) {
      yield this.createIssue(this.templates.otherField, null, fieldName, beatmap.beatmapInfo.difficultyName, otherBeatmap.beatmapInfo.difficultyName, field, otherField);
    }
  }
}
