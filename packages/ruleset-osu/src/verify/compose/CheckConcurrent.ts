import type { CheckMetadata, Issue, VerifierBeatmap } from '@osucad/core';
import type { OsuHitObject } from '../../hitObjects/OsuHitObject';
import { BeatmapCheck, IssueTemplate, trimIndent } from '@osucad/core';
import { Spinner } from '../../hitObjects/Spinner';

export class CheckConcurrent extends BeatmapCheck<OsuHitObject> {
  override get metadata(): CheckMetadata {
    return {
      category: 'Compose',
      message: 'Concurrent hit objects.',
      author: 'Naxess',
      documentation: [
        {
          title: 'Purpose',
          description: 'Ensuring that only one object needs to be interacted with at any given moment in time.',
        },
        {
          title: 'Reasoning',
          description: trimIndent(`
                      A clickable object during the duration of an already clicked object, for example a slider, is possible to play
              assuming the clickable object is within the slider circle whenever a slider tick/edge happens. However, there is
              no way for a player to intuitively know how to play such patterns as there is no tutorial for them, and they are
              not self-explanatory.
              <br><br>
              Sliders, spinners, and other holdable objects, teach the player to hold down the key for
              the whole duration of the object, so suddenly forcing them to press again would be contradictory to that
              fundamental understanding. Because of this, these patterns more often than not cause confusion, even where
              otherwise introduced well.
              <image-right>
                  https://i.imgur.com/2bTX4aQ.png
                  A slider with two concurrent circles. Can be hit without breaking combo.
              </image>
          `),
        },
      ],
    };
  }

  override templates = {
    concurrent: new IssueTemplate('problem', '{0:timestamp} Concurrent.', 'timestamp - ', 'hit objects').withCause('A hit object starts before another hit object has ended. For mania this also ' + 'requires that the objects are in the same column.'),
    almostConcurrent: new IssueTemplate('problem', '{0:timestamp} Within {1} ms of one another.', 'timestamp - ', 'gap').withCause('Two hit objects are less than 10 ms apart from one another. For mania this also ' + 'requires that the objects are in the same column.'),
  };

  override async * getIssues(beatmap: VerifierBeatmap<OsuHitObject>): AsyncGenerator<Issue, void, undefined> {
    for (let i = 0; i < beatmap.hitObjects.length - 1; i++) {
      for (let j = i + 1; j < beatmap.hitObjects.length; j++) {
        const hitObject = beatmap.hitObjects.items[i];
        const next = beatmap.hitObjects.items[j];

        const msApart = next.startTime - hitObject.endTime;

        if (msApart <= 0) {
          yield this.createIssue(this.templates.concurrent, beatmap, [hitObject, next]);
        }
        else if (msApart <= 10 && !(hitObject instanceof Spinner)) {
          yield this.createIssue(this.templates.almostConcurrent, beatmap, [hitObject, next], Math.ceil(msApart));
        }
        else {
          // Hit objects are sorted by time, meaning if the next one is > 10 ms away, any remaining will be too.
          break;
        }
      }
    }
  }
}
