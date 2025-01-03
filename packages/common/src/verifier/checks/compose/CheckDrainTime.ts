import type { CheckMetadata } from '../../BeatmapCheck';
import type { Issue } from '../../Issue';
import type { VerifierBeatmap } from '../../VerifierBeatmap';
import { trimIndent } from '../../../utils/stringUtils';
import { BeatmapCheck } from '../../BeatmapCheck';

export class CheckDrainTime extends BeatmapCheck<any> {
  override get metadata(): CheckMetadata {
    return {
      category: 'Compose',
      message: 'Too short drain time',
      author: 'Naxess',
      documentation: [
        {
          title: 'Purpose',
          description: trimIndent(`
              Prevents beatmaps from being too short, for example 10 seconds long.
              <image>
                  https://i.imgur.com/uNDPeJI.png
                  A beatmap with a total mp3 length of ~21 seconds.
              </image>
          `),
        },
        {
          title: 'Reasoning',
          description: trimIndent(`
              Beatmaps this short do not offer a substantial enough gameplay experience for the standards of
              the ranked section.
          `),
        },
      ],
    };
  }

  override * getIssues(beatmap: VerifierBeatmap<any>): Generator<Issue, void, undefined> {
    const drainTime = getDrainTime(beatmap);

    if (drainTime >= 30 * 1000)
      return;

    yield this.createIssue({
      level: 'problem',
      message: `Less than 30 seconds of drain time, currently ${Math.round(drainTime)}.`,
      cause: 'The time from the first object to the end of the last object, subtracting any time between two objects ' + 'where a break exists, is in total less than 30 seconds.',
    });
  }
}

function getDrainTime(beatmap: VerifierBeatmap) {
  // TODO: breaks

  if (beatmap.hitObjects.items.length === 0)
    return 0;

  return beatmap.hitObjects.last!.endTime - beatmap.hitObjects.first!.startTime;
}
