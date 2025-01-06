import type { CheckMetadata } from '../../../../verifier/BeatmapCheck';
import type { Issue } from '../../../../verifier/Issue';
import type { VerifierBeatmap } from '../../../../verifier/VerifierBeatmap';
import type { OsuHitObject } from '../../hitObjects/OsuHitObject';
import { BeatmapCheck } from '../../../../verifier/BeatmapCheck';
import { IssueTemplate } from '../../../../verifier/template/IssueTemplate';
import { DifficultyType } from '../../../../verifier/VerifierBeatmap';
import { Slider } from '../../hitObjects/Slider';

// Ported from https://github.com/Naxesss/MapsetVerifier/blob/main/src/Checks/Standard/Spread/CheckShortSliders.cs
export class CheckShortSliders extends BeatmapCheck<OsuHitObject> {
  override get metadata(): CheckMetadata {
    return {
      category: 'Spread',
      message: 'Too short sliders.',
      author: 'Naxess',
      difficulties: [
        DifficultyType.Easy,
      ],
    };
  }

  override templates = {
    tooShort: new IssueTemplate('warning', '{0:timestamp} {1} ms, expected at least {2}.', 'timestamp - ', 'duration', 'threshold').withCause('A slider in an Easy difficulty is less than 125 ms (240 bpm 1/2).'),
  };

  override async* getIssues(beatmap: VerifierBeatmap<OsuHitObject>): AsyncGenerator<Issue, void, undefined> {
    const timeThreshold = 125;

    for (const slider of beatmap.hitObjects.ofType(Slider)) {
      if (slider.duration < timeThreshold) {
        yield this.createIssue(this.templates.tooShort, beatmap, slider, Math.round(slider.duration), timeThreshold);
      }
    }
  }
}
