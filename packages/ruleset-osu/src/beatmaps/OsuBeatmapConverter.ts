import type { HitObject, IBeatmap, Ruleset } from '@osucad/core';
import { BeatmapConverter, ConvertCircle, ConvertHitObject, ConvertSlider, ConvertSpinner } from '@osucad/core';
import { Vec2 } from '@osucad/framework';
import { HitCircle } from '../hitObjects/HitCircle';
import { OsuHitObject } from '../hitObjects/OsuHitObject';
import { Slider } from '../hitObjects/Slider';
import { Spinner } from '../hitObjects/Spinner';
import { OsuBeatmap } from './OsuBeatmap';

export class OsuBeatmapConverter extends BeatmapConverter<OsuHitObject> {
  constructor(beatmap: IBeatmap, ruleset: Ruleset) {
    super(beatmap, ruleset);
  }

  protected override createBeatmap(): IBeatmap<OsuHitObject> {
    return new OsuBeatmap();
  }

  override canConvert(): boolean {
    return this.beatmap.hitObjects.items.every(it => (it instanceof OsuHitObject || it instanceof ConvertHitObject));
  }

  protected override * convertHitObject(hitObject: HitObject, original: IBeatmap): Generator<OsuHitObject, void, undefined> {
    if (hitObject instanceof OsuHitObject) {
      yield hitObject;
      return;
    }

    if (hitObject instanceof ConvertCircle) {
      const circle = new HitCircle();
      circle.startTime = hitObject.startTime;
      circle.position = hitObject.position;
      circle.hitSound = hitObject.hitSound;
      circle.newCombo = hitObject.newCombo;
      circle.comboOffset = hitObject.comboOffset;
      yield circle;
    }

    if (hitObject instanceof ConvertSlider) {
      const slider = new Slider();
      slider.startTime = hitObject.startTime;
      slider.position = hitObject.position;
      slider.hitSound = hitObject.hitSound;
      slider.newCombo = hitObject.newCombo;
      slider.comboOffset = hitObject.comboOffset;
      slider.path.controlPoints = hitObject.path.controlPoints;
      slider.path.expectedDistance = hitObject.path.expectedDistance;
      slider.repeatCount = hitObject.repeatCount;
      slider.hitSounds = hitObject.hitSounds;
      yield slider;
    }

    if (hitObject instanceof ConvertSpinner) {
      const spinner = new Spinner();

      spinner.position = new Vec2(256, 192);
      spinner.startTime = hitObject.startTime;
      spinner.duration = hitObject.duration;
      spinner.newCombo = true;

      yield spinner;
    }
  }
}
