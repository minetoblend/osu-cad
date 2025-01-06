import type { Sample } from 'osucad-framework';
import type { CheckMetadata } from '../../BeatmapCheck';
import type { Issue } from '../../Issue';
import type { VerifierBeatmapSet } from '../../VerifierBeatmapSet';
import toWav from 'audiobuffer-to-wav';
import { Axes, Box, MenuItem } from 'osucad-framework';
import { getAmplitudesFromAudioBuffer, mergeAmplitudes } from '../../../audio/getAmplitudesFromAudioBuffer';
import { maxOf } from '../../../utils/arrayUtils';
import { trimIndent } from '../../../utils/stringUtils';
import { GeneralCheck } from '../../GeneralCheck';
import { IssueTemplate } from '../../template/IssueTemplate';
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

  override templates = {
    pureDelay: new IssueTemplate('problem', '"{0}" has a {1:##} ms period of complete silence at the start. {3}', 'path', 'pure delay', 'waveform').withCause('A hit sound file used on an active hit object has a definite delay (complete silence) of at least 5 ms.'),
    delay: new IssueTemplate('warning', '"{0}" has a delay of ~{2:##} ms, of which {1:##} ms is complete silence. (Active at e.g. {3} in {4}.) {5}', 'path', 'pure delay', 'delay', 'timestamp', 'difficulty', 'waveform').withCause('A hit sound file used on an active hit object has very low volume for ~5 ms or more.'),
    minorDelay: new IssueTemplate('minor', '"{0}" has a delay of ~{2:##} ms, of which {1:##} ms is complete silence. {2}', 'path', 'pure delay', 'delay', 'waveform').withCause('Same as the regular delay, except anything between 1 to 5 ms.'),
  };

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
        const issueSample = new IssueSample(sample).adjust(it => it.add(
          new Box({
            relativeSizeAxes: Axes.Both,
            color: 0xFF4B60,
            width: pureDelay / sample.length,
            depth: 1,
            alpha: 0.5,
          }),
        ));

        yield this.createIssue(this.templates.pureDelay, null, sampleInfo.sampleName, pureDelay, issueSample)
          .withActions(
            new MenuItem({
              text: 'Trim complete silence',
              action: () => this.createTrimmedSample(`${sampleInfo.indexedSampleName}.wav`, sample, pureDelay),
            }),
          );
      }
      else if (delay + pureDelay >= 5) {
        const issueSample = new IssueSample(sample).adjust(it => it.addAll(
          new Box({
            relativeSizeAxes: Axes.Both,
            relativePositionAxes: Axes.X,
            color: 0xFF4B60,
            x: pureDelay / sample.length,
            width: delay / sample.length,
            depth: 1,
            alpha: 0.25,
          }),
          new Box({
            relativeSizeAxes: Axes.Both,
            color: 0xFF4B60,
            width: pureDelay / sample.length,
            depth: 1,
            alpha: 0.5,
          }),
        ));

        yield this.createIssue(this.templates.delay, null, sampleInfo.sampleName, delay, pureDelay, sampleInfo.time, beatmap, issueSample)
          .withActions(
            new MenuItem({
              text: 'Trim complete silence',
              action: () => this.createTrimmedSample(`${sampleInfo.indexedSampleName}.wav`, sample, delay),
            }),
          );
      }
      else if (delay + pureDelay >= 1) {
        yield this.createIssue(this.templates.minorDelay, null, sampleInfo.sampleName, delay, pureDelay, new IssueSample(sample));
      }
    }
  }

  createTrimmedSample(filename: string, sample: Sample, trimStart: number) {
    const buffer = sample.buffer;

    const newBuffer = new AudioContext().createBuffer(buffer.numberOfChannels, buffer.length - Math.floor(trimStart / 1000 * buffer.sampleRate), buffer.sampleRate);

    const offset = buffer.length - newBuffer.length;

    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const data = buffer.getChannelData(channel);
      newBuffer.copyToChannel(data.slice(offset, newBuffer.length), channel);
    }

    const wav = toWav(newBuffer);

    const link = document.createElement('a');

    const blob = new Blob([wav], { type: 'audio/wav' });

    const url = URL.createObjectURL(blob);

    link.download = filename;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }
}
