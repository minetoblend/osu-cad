import type { Color } from 'pixi.js';
import type { OsuHitObject } from './hitObjects/OsuHitObject';
import type { HitSound } from './hitSounds/HitSound';
import type { IBeatmap } from './IBeatmap.ts';
import { HitType } from 'osu-classes';
import { almostEquals, clamp } from 'osucad-framework';
import { HitObjectUtils } from '../editor/screens/compose/HitObjectUtils';
import { HitCircle } from './hitObjects/HitCircle';
import { PathType } from './hitObjects/PathType';
import { Slider } from './hitObjects/Slider';
import { Spinner } from './hitObjects/Spinner';
import { ControlPointGroup } from './timing/ControlPointGroup';
import { ControlPointInfo } from './timing/ControlPointInfo';
import { DifficultyPoint } from './timing/DifficultyPoint';

export class StableBeatmapEncoder {
  encode(beatmap: IBeatmap): string {
    const lines = [
      'osu file format v14',
      '',
      '[General]',
      ...this.#encodeGeneral(beatmap),
      '',
      '[Editor]',
      ...this.#encodeEditor(beatmap),
      '',
      '[Metadata]',
      ...this.#encodeMetadata(beatmap),
      '',
      '[Difficulty]',
      ...this.#encodeDifficulty(beatmap),
      '',
      '[Events]',
      ...this.#encodeEvents(beatmap),
      '',
      '[TimingPoints]',
      ...this.#encodeTimingPoints(beatmap),
      '',
      '[Colours]',
      ...this.#encodeColours(beatmap),
      '',
      '[HitObjects]',
      ...this.#encodeHitObjects(beatmap),
    ];

    return lines.join('\n');
  }

  #roundToPrecision(value: number, precision: number) {
    const factor = 10 ** precision;
    return Math.round(value * factor) / factor;
  }

  #boolToInt(value: boolean) {
    return value ? 1 : 0;
  }

  * #encodeGeneral(beatmap: IBeatmap) {
    yield `AudioFilename: ${beatmap.settings.audioFileName}`;
    yield `AudioLeadIn: ${beatmap.settings.audioLeadIn}`;
    yield `PreviewTime: ${beatmap.settings.previewTime}`;
    yield `Countdown: ${beatmap.settings.countdown}`;
    yield `SampleSet: ${beatmap.settings.sampleSet}`; // TODO: Convert to parsed sampleset
    yield `StackLeniency: ${this.#roundToPrecision(beatmap.settings.stackLeniency, 1)}`;
    yield `Mode: 0`;
    yield `LetterboxInBreaks: ${this.#boolToInt(beatmap.settings.letterboxInBreaks)}`;
    yield `UseSkinSprites: ${this.#boolToInt(beatmap.settings.useSkinSprites)}`;
    yield `OverlayPosition: NoChange`;
    yield `SkinPreference: ${beatmap.settings.skinPreference}`;
    yield `EpilepsyWarning: ${this.#boolToInt(beatmap.settings.epilepsyWarning)}`;
    yield `CountdownOffset: ${beatmap.settings.countdownOffset}`;
    yield `SpecialStyle: ${this.#boolToInt(beatmap.settings.specialStyle)}`;
    yield `WidescreenStoryboard: ${this.#boolToInt(beatmap.settings.widescreenStoryboard)}`;
    yield `SamplesMatchPlaybackRate: ${this.#boolToInt(beatmap.settings.samplesMatchPlaybackRate)}`;
  }

  * #encodeEditor(beatmap: IBeatmap) {
    console.log(beatmap.settings.editor.gridSize);
    yield `Bookmarks: ${beatmap.settings.editor.bookmarks.map(it => Math.round(it)).join(',')}`;
    yield `DistanceSpacing: ${this.#roundToPrecision(beatmap.settings.editor.distanceSpacing, 1)}`;
    yield `BeatDivisor: ${beatmap.settings.editor.beatDivisor}`;
    yield `GridSize: ${beatmap.settings.editor.gridSize}`;
    yield `TimelineZoom: ${this.#roundToPrecision(beatmap.settings.editor.timelineZoom, 1)}`;
  }

  * #encodeMetadata(beatmap: IBeatmap) {
    yield `Title: ${beatmap.metadata.title}`;
    yield `TitleUnicode: ${beatmap.metadata.titleUnicode}`;
    yield `Artist: ${beatmap.metadata.artist}`;
    yield `ArtistUnicode: ${beatmap.metadata.artistUnicode}`;
    yield `Creator: ${beatmap.metadata.creator}`;
    yield `Version: ${beatmap.metadata.difficultyName}`;
    yield `Source: ${beatmap.metadata.source}`;
    yield `Tags: ${beatmap.metadata.tags}`;
    yield `BeatmapID: ${beatmap.metadata.osuWebId}`;
    yield `BeatmapSetID: ${beatmap.metadata.osuWebSetId}`;
  }

  * #encodeDifficulty(beatmap: IBeatmap) {
    yield `HPDrainRate: ${this.#roundToPrecision(beatmap.difficulty.hpDrainRate, 1)}`;
    yield `CircleSize: ${this.#roundToPrecision(beatmap.difficulty.circleSize, 1)}`;
    yield `OverallDifficulty: ${this.#roundToPrecision(beatmap.difficulty.overallDifficulty, 1)}`;
    yield `ApproachRate: ${this.#roundToPrecision(beatmap.difficulty.approachRate, 1)}`;
    yield `SliderMultiplier: ${this.#roundToPrecision(beatmap.difficulty.sliderMultiplier, 1)}`;
    yield `SliderTickRate: ${this.#roundToPrecision(beatmap.difficulty.sliderTickRate, 1)}`;
  }

  * #encodeEvents(beatmap: IBeatmap) {
    yield `//Background and Video events`;
    if (beatmap.settings.backgroundFilename)
      yield `0,0,"${beatmap.settings.backgroundFilename}",0,0`;
    yield `//Break Periods`;
    yield `//Storyboard Layer 0 (Background)`;
    yield `//Storyboard Layer 1 (Fail)`;
    yield `//Storyboard Layer 2 (Pass)`;
    yield `//Storyboard Layer 3 (Foreground)`;
    yield `//Storyboard Layer 4 (Overlay)`;
    yield `//Storyboard Sound Samples`;
  }

  * #encodeTimingPoints(beatmap: IBeatmap) {
    if (beatmap.controlPoints.groups.length === 0)
      return;

    const controlPoints = new ControlPointInfo();

    for (const group of beatmap.controlPoints.groups) {
      controlPoints.add(group);
    }

    for (let i = 0; i < beatmap.hitObjects.length; i++) {
      const hitObject = beatmap.hitObjects.get(i)!;

      if (hitObject instanceof Slider) {
        const velocity = hitObject.velocity / hitObject.baseVelocity;

        const difficultyPoint = controlPoints.difficultyPointAt(hitObject.startTime);

        if (!almostEquals(velocity, difficultyPoint.sliderVelocity)) {
          let group = controlPoints.groups.controlPointAt(hitObject.startTime);

          if (!group || group.time !== hitObject.startTime) {
            group = new ControlPointGroup(hitObject.startTime);
            controlPoints.add(group);
          }
          else {
            const oldGroup = group;

            group = group.deepClone();
            if (group.difficulty)
              group.remove(group.difficulty);

            controlPoints.groups.remove(oldGroup);
            controlPoints.add(group);
          }

          const newPoint = new DifficultyPoint(velocity);
          group.add(newPoint);

          console.log(group.time, velocity);
        }
      }
    }

    for (const group of controlPoints.groups) {
      const samplePoint = group.sample ?? controlPoints.samplePointAt(group.time);
      const effectPoint = group.effect ?? controlPoints.effectPointAt(group.time);
      const difficultyPoint = group.difficulty ?? controlPoints.difficultyPointAt(group.time);

      let effects = 0;

      if (effectPoint.kiaiMode)
        effects |= 1;

      if (group.timing) {
        yield [
          group.time,
          group.timing.beatLength,
          group.timing.meter,
          samplePoint.sampleSet,
          samplePoint.sampleIndex,
          clamp(Math.round(samplePoint.volume), 5, 100),
          1,
          effects,
        ].join(',');
      }

      if (group.difficulty || difficultyPoint.sliderVelocity !== 1 || !group.timing) {
        yield [
          group.time,
          this.#roundToPrecision(-100 / difficultyPoint.sliderVelocity, 2),
          0,
          samplePoint.sampleSet,
          samplePoint.sampleIndex,
          clamp(Math.round(samplePoint.volume), 5, 100),
          0,
          effects,
        ];
      }
    }
  }

  #encodeColor(color: Color) {
    const hex = color.toNumber();

    return `${(hex >> 16) & 0xFF},${(hex >> 8) & 0xFF},${hex & 0xFF}`;
  }

  * #encodeColours(beatmap: IBeatmap) {
    for (let i = 0; i < beatmap.colors.comboColors.length; i++) {
      yield `Combo${i + 1}: ${this.#encodeColor(beatmap.colors.comboColors[i])}`;
    }

    if (beatmap.colors.sliderTrackOverride)
      yield `SliderTrackOverride: ${this.#encodeColor(beatmap.colors.sliderTrackOverride)}`;

    if (beatmap.colors.sliderBorder)
      yield `SliderBorder: ${this.#encodeColor(beatmap.colors.sliderBorder)}`;
  }

  * #encodeHitObjects(beatmap: IBeatmap) {
    for (const hitObject of beatmap.hitObjects)
      yield * this.#encodeHitObject(hitObject);
  }

  * #encodeHitObject(hitObject: OsuHitObject) {
    if (hitObject instanceof HitCircle)
      yield this.#encodeHitCircle(hitObject);
    else if (hitObject instanceof Slider)
      yield this.#encodeSlider(hitObject);
    else if (hitObject instanceof Spinner)
      yield this.#encodeSpinner(hitObject);
  }

  * #encodeHitObjectBase(hitObject: OsuHitObject, type: HitType) {
    yield Math.round(hitObject.x);
    yield Math.round(hitObject.y);
    yield Math.round(hitObject.startTime);

    if (hitObject.newCombo)
      type |= HitType.NewCombo;

    type |= hitObject.comboOffset << 4;

    yield type;

    yield hitObject.hitSound.additions << 1;
  }

  #encodeHitSamples(hitSound: HitSound) {
    return [
      hitSound.sampleSet,
      hitSound.additionSampleSet,
      0, // index
      0, // volume
      '', // filename
    ].join(':');
  }

  #encodeHitCircle(hitCircle: HitCircle): string {
    return [
      ...this.#encodeHitObjectBase(hitCircle, HitType.Normal),
      this.#encodeHitSamples(hitCircle.hitSound),
    ].join(',');
  }

  #encodeSlider(slider: Slider): string {
    let numBezier = 0;
    let numElse = 0;

    for (const p of slider.controlPoints) {
      if (p.type === PathType.Bezier)
        numBezier++;
      else if (p.type !== null)
        numElse++;
    }

    let path = slider.controlPoints;
    if (numBezier + numElse > 1 || numElse > 1)
      path = HitObjectUtils.pathToBezier([...path]);

    const type = path[0].type ?? PathType.Bezier;

    const encodedPath: string[] = [];

    switch (type) {
      case PathType.Bezier:
        encodedPath.push('B');
        break;
      case PathType.PerfectCurve:
        encodedPath.push('P');
        break;
      case PathType.Catmull:
        encodedPath.push('C');
        break;
      case PathType.Linear:
        encodedPath.push('L');
        break;
    }

    let currentType: PathType = path[0].type || PathType.Bezier;

    for (let i = 1; i < path.length; i++) {
      const point = path[i];

      const pointString = `${Math.round(point.x + slider.x)}:${Math.round(point.y + slider.y)}`;

      encodedPath.push(pointString);

      if (point.type !== null)
        currentType = point.type;

      if (point.type !== null || currentType === PathType.Linear)
        encodedPath.push(pointString);
    }

    const edgeSounds: string[] = [];
    const edgeSets: string[] = [];

    slider.ensureHitSoundsAreValid();
    for (const hitSound of slider.hitSounds) {
      edgeSounds.push((hitSound.additions << 1).toString());
      edgeSets.push(`${hitSound.sampleSet}:${hitSound.additionSampleSet}`);
    }

    return [
      ...this.#encodeHitObjectBase(slider, HitType.Slider),
      encodedPath.join('|'),
      slider.spanCount,
      slider.path.expectedDistance,
      edgeSounds.join('|'),
      edgeSets.join('|'),
      this.#encodeHitSamples(slider.hitSound),
    ].join(',');
  }

  #encodeSpinner(spinner: Spinner): string {
    return [
      ...this.#encodeHitObjectBase(spinner, HitType.Spinner),
      spinner.endTime,
      this.#encodeHitSamples(spinner.hitSound),
    ].join(',');
  }
}
