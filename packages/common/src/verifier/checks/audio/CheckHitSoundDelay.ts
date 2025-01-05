import type { CheckMetadata } from '../../BeatmapCheck';
import type { Issue } from '../../Issue';
import type { VerifierBeatmapSet } from '../../VerifierBeatmapSet';
import { getAmplitudesFromAudioBuffer, mergeAmplitudes } from '../../../audio/getAmplitudesFromAudioBuffer';
import { TimestampFormatter } from '../../../editor/TimestampFormatter';
import { maxOf } from '../../../utils/arrayUtils';
import { trimIndent } from '../../../utils/stringUtils';
import { GeneralCheck } from '../../GeneralCheck';
import { IssueSample } from './IssueSample';

// Ported from https://github.com/Naxesss/MapsetVerifier/blob/main/src/Checks/AllModes/General/Audio/CheckHitSoundDelay.cs
export class CheckHitSoundDelay extends GeneralCheck {
  override get metadata(): CheckMetadata {
    return {
      category: 'Audio',
      message: 'Delayed hit sounds.',
      author: 'Naxess',
      documentation: [
        {
          title: 'Purpose',
          description: trimIndent(`
              Ensuring hit sounds which are used on active hit objects provide proper feedback for how early or late the player clicked.
              <image>
                  https://i.imgur.com/LRpgqcJ.png
                  A hit sound which is delayed by ~10 ms, as shown in Audacity. Note that audacity shows its
                  timeline in seconds, so 0.005 means 5 ms.
              </image>"
          `),
        },
      ],
    };
  }

  override async * getIssues(mapset: VerifierBeatmapSet): AsyncGenerator<Issue, void, undefined> {
    for (const { sample, sampleInfo, beatmap } of mapset.getAllUsedHitSoundSamples()) {
      const channelAmplitudes = getAmplitudesFromAudioBuffer(sample.buffer, 1);

      const amplitudes = mergeAmplitudes(channelAmplitudes);

      const maxStrength = maxOf(amplitudes);

      if (amplitudes.length === 0 || maxStrength === 0)
        // Muted files don't have anything to be delayed, hence ignore.
        continue;

      let delay = 0;
      let pureDelay = 0;
      let strength = 0;

      while (delay + pureDelay < amplitudes.length) {
        strength += Math.abs(amplitudes[delay]);

        if (strength >= maxStrength / 2)
          break;

        strength *= 0.95;

        // The delay added by MP3 encoding still has very slight volume where it's basically silent.
        if (strength < 0.001) {
          strength = 0;
          ++pureDelay;
          ++delay;
        }
        else {
          ++delay;
        }
      }

      if (pureDelay >= 5) {
        yield this.createIssue({
          level: 'problem',
          message: [
            `"${sampleInfo.sampleName}" has a ${pureDelay.toFixed(2)} ms period of complete silence at the start.`,
            new IssueSample(sample),
          ],
          cause: 'A hit sound file used on an active hit object has a definite delay (complete silence) of at least 5 ms.',
        });
      }
      else if (delay + pureDelay >= 5) {
        yield this.createIssue({
          level: 'warning',
          message: [
            `"${sampleInfo.sampleName}" has a delay of ~${pureDelay.toFixed(2)} ms, of which ${delay.toFixed(2)} ms is complete silence. (Active at e.g. ${TimestampFormatter.formatTimestamp(sampleInfo.time)} in ${beatmap.metadata.difficultyName}.)`,
            new IssueSample(sample),
          ],
        });
      }
      else if (delay + pureDelay >= 1) {
        yield this.createIssue({
          level: 'warning',
          message: [
            `"${sampleInfo.sampleName}" has a delay of ${pureDelay} ms, of which ${delay.toFixed(2)} ms are pure silence.`,
            new IssueSample(sample),
          ],
        });
      }
    }
  }
}
