import type { CheckMetadata, HitObject, Issue, VerifierBeatmap } from '@osucad/common';
import type { OsuHitObject } from '../../hitObjects/OsuHitObject';
import { BeatmapCheck, IssueTemplate, trimIndent } from '@osucad/common';
import { almostEquals } from 'osucad-framework';
import { HitCircle } from '../../hitObjects/HitCircle';
import { Slider } from '../../hitObjects/Slider';
import { SliderHeadCircle } from '../../hitObjects/SliderHeadCircle';
import { SliderRepeat } from '../../hitObjects/SliderRepeat';
import { SliderTailCircle } from '../../hitObjects/SliderTailCircle';
import { SliderTick } from '../../hitObjects/SliderTick';

// Ported from https:// github.com/Naxesss/MapsetVerifier/blob/main/src/Checks/AllModes/HitSounds/CheckMuted.cs
export class CheckMuted extends BeatmapCheck<OsuHitObject> {
  override get metadata(): CheckMetadata {
    return {
      category: 'Hit Sounds',
      message: 'Low volume hit sounding.',
      author: 'Naxess',
      documentation: [
        {
          title: 'Purpose',
          description: 'Ensuring that active hit object feedback is audible.',
        },
        {
          title: 'Reasoning',
          description: trimIndent(`
              All active hit objects (i.e. circles, slider heads, and starts of hold notes) should provide some feedback
              so that players can hear if they're clicking too early or late. By reducing the volume to the point where
              it is difficult to hear over the song, hit sounds cease to function as proper feedback.

              Reverses are generally always done on sound cues, and assuming that's the case, it wouldn't make much sense
              being silent.
          `),
        },
      ],
    };
  }

  override templates = {
    'Warning Volume': new IssueTemplate('warning', '{0:timestamp} {1}% volume {2}, this may be hard to hear over the song.', 'timestamp - ', 'percent', 'active hit object').withCause('An active hit object is at 10% or lower volume.'),
    'Minor Volume': new IssueTemplate('minor', '{0:timestamp} {1}% volume {2}, this may be hard to hear over the song.', 'timestamp - ', 'percent', 'active hit object').withCause('An active hit object is at 20% or lower volume.'),
    'Passive Reverse': new IssueTemplate('warning', '{0:timestamp} {1}% volume {2}, ensure there is no distinct sound here in the song.', 'timestamp - ', 'percent', 'reverse').withCause('A slider reverse is at 10% or lower volume.'),
    'Passive': new IssueTemplate('minor', '{0:timestamp} {1}% volume {2}, ensure there is no distinct sound here in the song.', 'timestamp - ', 'percent', 'tick/tail').withCause('A passive hit object is at 10% or lower volume.'),
  };

  override async * getIssues(beatmap: VerifierBeatmap<OsuHitObject>): AsyncGenerator<Issue, void, undefined> {
    for (const hitObject of beatmap.hitObjects) {
      if (!(hitObject instanceof HitCircle || hitObject instanceof Slider))
        continue;

      const volume = beatmap.controlPoints.volumeAt(hitObject.startTime + 1);

      if (!(hitObject instanceof Slider)) {
        yield * this.getIssue(hitObject, beatmap, null, volume, true);
        continue;
      }

      for (const nested of hitObject.nestedHitObjects) {
        const volume = beatmap.controlPoints.volumeAt(nested.startTime + 1);

        if (nested instanceof SliderHeadCircle)
          yield * this.getIssue(hitObject, beatmap, nested, volume, true);
        if (nested instanceof SliderTailCircle)
          yield * this.getIssue(hitObject, beatmap, nested, volume, false);
        if (nested instanceof SliderRepeat)
          yield * this.getIssue(hitObject, beatmap, nested, volume, true);
        else if (nested instanceof SliderTick)
          yield * this.getIssue(hitObject, beatmap, nested, volume, false);
      }
    }
  }

  * getIssue(hitObject: OsuHitObject, beatmap: VerifierBeatmap<OsuHitObject>, nested: HitObject | null, volume: number, isActive: boolean = false) {
    volume = Math.max(5, volume);

    if (volume > 20)
      // Volumes greater than 20% are usually audible.
      return;

    const isHead = !nested || almostEquals(nested.startTime, hitObject.startTime);
    const timestamp = isHead ? hitObject : nested?.startTime ?? hitObject.startTime;
    const partName = getPartName(hitObject, nested).toLowerCase();

    if (isActive) {
      if (isHead) {
        if (volume <= 10)
          yield this.createIssue(this.templates['Warning Volume'], beatmap, timestamp, Math.round(volume), partName);
        else
          yield this.createIssue(this.templates['Minor Volume'], beatmap, timestamp, Math.round(volume), partName);
      }
      else {
        // Must be a slider reverse, mappers rarely map these to nothing.
        if (volume <= 10)
          yield this.createIssue(this.templates['Passive Reverse'], beatmap, timestamp, Math.round(volume), partName);
      }
    }
    else if (volume <= 10) {
      yield this.createIssue(this.templates.Passive, beatmap, timestamp, Math.round(volume), partName);
    }
  }
}

function getPartName(hitObject: HitObject, nestedHitObject: HitObject | null) {
  switch ((nestedHitObject ?? hitObject).constructor) {
    case HitCircle:
      return 'Circle';
    case SliderHeadCircle:
    case Slider:
      return 'Slider head';
    case SliderTailCircle:
      return 'Slider tail';
    case SliderTick:
      return 'Slider tick';
    case SliderRepeat:
      return 'Slider repeat';
    default:
      return 'Hit Object';
  }
}
