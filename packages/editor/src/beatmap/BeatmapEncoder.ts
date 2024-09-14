import { Beatmap } from './Beatmap.ts';
import yaml from 'yaml';
import { BeatmapMetadata } from './BeatmapMetadata.ts';
import { BeatmapDifficultyInfo } from './BeatmapDifficultyInfo.ts';
import { BeatmapColors } from './BeatmapColors.ts';
import { Color } from 'pixi.js';
import { BeatmapSettings } from './BeatmapSettings.ts';
import { ControlPointInfo } from './timing/ControlPointInfo.ts';
import { SampleSet } from './hitSounds/SampleSet.ts';
import { OsuHitObject } from './hitObjects/OsuHitObject.ts';
import { HitObjectList } from './hitObjects/HitObjectList.ts';
import { HitCircle } from './hitObjects/HitCircle.ts';
import { Slider } from './hitObjects/Slider.ts';
import { Vec2 } from '../../../framework/src';
import { HitSound } from './hitSounds/HitSound.ts';
import { Additions } from './hitSounds/Additions.ts';
import { IPathPoint } from './hitObjects/PathPoint.ts';
import { PathType } from './hitObjects/PathType.ts';
import { Spinner } from './hitObjects/Spinner.ts';

export class BeatmapEncoder {

  encode(beatmap: Beatmap) {
    const document = new yaml.Document({
      version: 1,
    });

    this.#encodeMetadata(document, beatmap.metadata);
    this.#encodeSettings(document, beatmap.settings);
    this.#encodeDifficulty(document, beatmap.difficulty);
    this.#encodeColors(document, beatmap.colors);
    this.#encodeControlPoints(document, beatmap.controlPoints);
    this.#encodeHitObjects(document, beatmap.hitObjects);

    return document.toString({
      nullStr: '',
      indentSeq: false,
      flowCollectionPadding: false
    });
  }

  #encodeMetadata(document: yaml.Document, metadata: BeatmapMetadata) {
    document.set('metadata', {
      artist: metadata.artist,
      artistUnicode: metadata.artistUnicode || null,
      title: metadata.title,
      titleUnicode: metadata.titleUnicode || null,
      source: metadata.source,
      tags: metadata.tags || null,
      previewTime: metadata.previewTime,
      creator: metadata.creator,
      difficultyName: metadata.difficultyName,
      osuWebId: metadata.osuWebId,
      osuWebSetId: metadata.osuWebSetId,
    });
  }

  #encodeDifficulty(document: yaml.Document, difficulty: BeatmapDifficultyInfo) {
    document.set('difficulty', {
      hpDrainRate: difficulty.hpDrainRate,
      circleSize: difficulty.circleSize,
      overallDifficulty: difficulty.overallDifficulty,
      approachRate: difficulty.approachRate,
      sliderMultiplier: difficulty.sliderMultiplier,
      sliderTickRate: difficulty.sliderTickRate,
    });
  }

  #encodeColors(document: yaml.Document, colors: BeatmapColors) {
    document.set('colors', {
      comboColors: colors.comboColors.map(color => new Color(color).toHex()),
      sliderTrackOverride: colors.sliderTrackOverride?.toHex(),
      sliderBorder: colors.sliderBorder?.toHex(),
    });
  }

  #encodeSettings(document: yaml.Document, settings: BeatmapSettings) {
    document.set('settings', {
      audioFileName: settings.audioFileName,
      audioLeadIn: settings.audioLeadIn,
      audioHash: settings.audioHash,
      previewTime: settings.previewTime,
      countdown: settings.countdown,
      sampleSet: settings.sampleSet,
      stackLeniency: settings.stackLeniency,
      mode: settings.mode,
      letterboxInBreaks: settings.letterboxInBreaks,
      useSkinSprites: settings.useSkinSprites,
      alwaysShowPlayfield: settings.alwaysShowPlayfield,
      overlayPosition: settings.overlayPosition,
      skinPreference: settings.skinPreference,
      epilepsyWarning: settings.epilepsyWarning,
      countdownOffset: settings.countdownOffset,
    });
  }

  #encodeSampleSet(sampleSet: SampleSet) {
    switch (sampleSet) {
      case SampleSet.Auto:
        return 'auto';
      case SampleSet.Normal:
        return 'normal';
      case SampleSet.Soft:
        return 'soft';
      case SampleSet.Drum:
        return 'drum';
    }
  }

  #encodeControlPoints(document: yaml.Document, controlPoints: ControlPointInfo) {
    document.set('controlPoints',
      controlPoints.groups.items
        .filter(group => group.children.size > 0)
        .map(group => {
          const object: any = {
            time: group.time,
          };

          if (group.timing) {
            object.timing = {
              bpm: Math.round(group.timing.bpm * 1000) / 1000,
              meter: group.timing.meter === 4 ? null : group.timing.meter,
            };
          }

          if (group.difficulty) {
            object.difficulty = {
              sliderVelocity: Math.round(group.difficulty.sliderVelocity * 100) / 100,
            };
          }

          if (group.sample) {
            let sampleSet = this.#encodeSampleSet(group.sample.sampleSet);

            if (group.sample.sampleIndex !== 1)
              sampleSet += `:${group.sample.sampleIndex}`;

            object.sample = {
              time: group.sample.time,
              sampleSet,
              volume: Math.round(group.sample.volume * 100) / 100,
            };
          }

          if (group.effect) {
            object.effect = {
              time: group.effect.kiaiMode,
            };
          }

          return object;
        }),
    );
  }

  #encodeHitObjects(document: yaml.Document, hitObjects: HitObjectList) {
    document.set('hitObjects', hitObjects.items.map(hitObject => this.#encodeHitObject(document, hitObject)));
  }

  #encodeHitObject(document: yaml.Document, hitObject: OsuHitObject) {
    if (hitObject instanceof HitCircle)
      return this.#encodeHitCircle(document, hitObject);
    if (hitObject instanceof Slider)
      return this.#encodeSlider(document, hitObject);
    if (hitObject instanceof Spinner)
      return this.#encodeSpinner(document, hitObject);

    throw new Error('Unsupported hit object type');
  }

  #encodeVec2(document: yaml.Document, vec2: Vec2) {
    return document.createNode([this.#toPrecision(vec2.x, 2), this.#toPrecision(vec2.y, 2)], { flow: true });
  }

  #encodeAdditions(document: yaml.Document, additions: Additions) {
    const additionNames = [] as string[];

    if (additions === Additions.None)
      return null;

    if (additions & Additions.Whistle)
      additionNames.push('whistle');
    if (additions & Additions.Finish)
      additionNames.push('finish');
    if (additions & Additions.Clap)
      additionNames.push('clap');

    return document.createNode(additionNames, { flow: true });
  }

  #encodeHitSound(document: yaml.Document, hitSound: HitSound) {
    return {
      sampleSet: this.#encodeSampleSet(hitSound.sampleSet),
      additionSet: this.#encodeSampleSet(hitSound.additionSampleSet),
      additions: this.#encodeAdditions(document, hitSound.additions),
    };
  }

  #encodeHitObjectBase(document: yaml.Document, hitObject: OsuHitObject) {
    return {
      startTime: hitObject.startTime,
      position: this.#encodeVec2(document, hitObject.position),
      newCombo: hitObject.newCombo,
      comboOffset: hitObject.comboOffset ?? null,
      hitSound: this.#encodeHitSound(document, hitObject.hitSound),
    };
  }

  #encodeHitCircle(document: yaml.Document, hitCircle: HitCircle) {
    return {
      type: 'circle',
      ...this.#encodeHitObjectBase(document, hitCircle),
    };
  }

  #encodeSlider(document: yaml.Document, slider: Slider) {
    return {
      type: 'slider',
      ...this.#encodeHitObjectBase(document, slider),
      repeatCount: slider.repeatCount,
      velocity: slider.velocityOverride,
      length: slider.expectedDistance,
      path: slider.path.controlPoints.map(controlPoint => this.#encodePathPoint(document, controlPoint)),
      hitSounds: slider.hitSounds.map(hitSound => this.#encodeHitSound(document, hitSound)),
    };
  }

  #encodeSpinner(document: yaml.Document, spinner: Spinner) {
    return {
      type: 'spinner',
      ...this.#encodeHitObjectBase(document, spinner),
      duration: this.#toPrecision(spinner.duration, 2),
    };
  }

  #encodePathType(document: yaml.Document, pathType: PathType) {
    switch (pathType) {
      case PathType.Linear:
        return 'linear';
      case PathType.Catmull:
        return 'catmull';
      case PathType.Bezier:
        return 'bezier';
      case PathType.PerfectCurve:
        return 'curve';
    }
  }

  #toPrecision(value: number, precision: number) {
    return Math.round(value * 10 ** precision) / 10 ** precision;
  }

  #encodePathPoint(document: yaml.Document, pathPoint: IPathPoint) {
    return document.createNode(
      pathPoint.type === null
        ? [
          this.#toPrecision(pathPoint.position.x, 2),
          this.#toPrecision(pathPoint.position.y, 2),
        ]
        : [
          this.#toPrecision(pathPoint.position.x, 2),
          this.#toPrecision(pathPoint.position.y, 2),
          this.#encodePathType(document, pathPoint.type),
        ],
      { flow: true },
    );
  }
}
