import type {
  Beatmap as OsuBeatmap,
} from 'osu-classes';
import {
  DifficultyPoint,
  HitType,
  PathPoint,
  PathType,
  SliderPath,
  TimingPoint,
  Vector2,
} from 'osu-classes';
import {
  StandardBeatmap,
  Circle as StandardCircle,
  StandardRuleset,
  Slider as StandardSlider,
  Spinner as StandardSpinner,
} from 'osu-standard-stable';
import type {
  SerializedBeatmap,
} from '@osucad/common';
import {
  Beatmap,
  PathType as EditorPathType,
  HitCircle,
  Slider,
  Spinner,
} from '@osucad/common';

function convertBeatmap(beatmap: Beatmap): OsuBeatmap {
  const converted = new StandardBeatmap();

  converted.difficulty.drainRate = beatmap.difficulty.hpDrainRate;
  converted.difficulty.circleSize = beatmap.difficulty.circleSize;
  converted.difficulty.approachRate = beatmap.difficulty.approachRate;
  converted.difficulty.overallDifficulty = beatmap.difficulty.overallDifficulty;
  converted.difficulty.sliderMultiplier = beatmap.difficulty.sliderMultiplier;
  converted.difficulty.sliderTickRate = beatmap.difficulty.sliderTickRate;

  for (const timingPoint of beatmap.controlPoints.controlPoints) {
    if (timingPoint.timing) {
      const point = new TimingPoint();
      point.beatLength = timingPoint.timing.beatLength;

      converted.controlPoints.add(point, timingPoint.time);
    }

    if (timingPoint.velocityMultiplier !== null) {
      const point = new DifficultyPoint();
      point.isLegacy = true;
      point.sliderVelocity = timingPoint.velocityMultiplier;

      converted.controlPoints.add(point, timingPoint.time);
    }
  }

  for (const hitObject of beatmap.hitObjects.hitObjects) {
    if (hitObject instanceof HitCircle) {
      const object = new StandardCircle();

      object.hitType = HitType.Normal;

      object.startPosition = new Vector2(
        Math.round(hitObject.position.x),
        Math.round(hitObject.position.y),
      );
      object.startTime = Math.round(hitObject.startTime);
      object.isNewCombo = hitObject.isNewCombo;

      converted.hitObjects.push(object);
    }

    if (hitObject instanceof Slider) {
      const slider = new StandardSlider();
      slider.startPosition = new Vector2(
        Math.round(hitObject.position.x),
        Math.round(hitObject.position.y),
      );
      slider.startTime = Math.round(hitObject.startTime);
      slider.isNewCombo = hitObject.isNewCombo;
      slider.comboOffset = hitObject.comboOffset ?? 0;
      slider.repeats = hitObject.repeats;

      let type: PathType;
      switch (hitObject.path.controlPoints[0].type) {
        case EditorPathType.Bezier:
          type = PathType.Bezier;
          break;
        case EditorPathType.Catmull:
          type = PathType.Catmull;
          break;
        case EditorPathType.Linear:
          type = PathType.Linear;
          break;
        case EditorPathType.PerfectCurve:
          type = PathType.PerfectCurve;
          break;
        default:
          throw new Error('Invalid path type');
      }

      const controlPoints: PathPoint[] = [];

      for (const point of hitObject.path.controlPoints) {
        let type: PathType | null = null;
        switch (point.type) {
          case EditorPathType.Bezier:
            type = PathType.Bezier;
            break;
          case EditorPathType.Catmull:
            type = PathType.Catmull;
            break;
          case EditorPathType.Linear:
            type = PathType.Linear;
            break;
          case EditorPathType.PerfectCurve:
            type = PathType.PerfectCurve;
            break;
          default:
            type = null;
        }

        controlPoints.push(
          new PathPoint(
            new Vector2(Math.round(point.x), Math.round(point.y)),
            type,
          ),
        );
      }
      slider.path = new SliderPath(
        type,
        controlPoints,
        hitObject.expectedDistance,
      );

      if (
        hitObject.velocityOverride !== null
        && hitObject.velocityOverride !== undefined
      ) {
        if (hitObject.velocity) {
          const point = new DifficultyPoint();
          point.sliderVelocity = hitObject.velocity;
          converted.controlPoints.add(point, hitObject.startTime);
        }
      }

      slider.hitType = HitType.Slider;

      converted.hitObjects.push(slider);
    }

    if (hitObject instanceof Spinner) {
      const spinner = new StandardSpinner();
      spinner.startTime = Math.round(hitObject.startTime);
      spinner.endTime = Math.round(hitObject.startTime + hitObject.duration);
      spinner.isNewCombo = hitObject.isNewCombo;
      spinner.hitType = HitType.Spinner;
      converted.hitObjects.push(spinner);
    }

    const convertedObject
      = converted.hitObjects[converted.hitObjects.length - 1];

    convertedObject.applyDefaults(
      converted.controlPoints,
      converted.difficulty,
    );
  }

  return converted;
}

function calculateStarRating(beatmap: Beatmap) {
  const ruleset = new StandardRuleset();

  const standardBeatmap = ruleset.applyToBeatmap(convertBeatmap(beatmap));

  const difficulty = ruleset
    .createDifficultyCalculator(standardBeatmap)
    .calculate();

  return difficulty.starRating;
}

globalThis.onmessage = (event) => {
  const serializedBeatmap = event.data as SerializedBeatmap;

  const beatmap = new Beatmap(serializedBeatmap);

  const starRating = calculateStarRating(beatmap);
  globalThis.postMessage({ starRating });
};
