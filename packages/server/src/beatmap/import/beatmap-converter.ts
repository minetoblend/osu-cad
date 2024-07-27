import {
  Circle as OsuCircle,
  Slider as OsuSlider,
  Spinner as OsuSpinner,
  StandardBeatmap,
} from 'osu-standard-stable';
import {
  Beatmap,
  ControlPoint,
  defaultHitSoundLayers,
  HitCircle,
  hitObjectId,
  PathType,
  SerializedPathPoint,
  Slider,
  Spinner,
  EditorBookmark,
  defaultHitSound,
  SampleSet,
  Additions,
  HitSoundSample,
  HitSoundLayer,
  SampleType,
} from '@osucad/common';
import { HitSample, PathPoint } from 'osu-classes';

export class BeatmapConverter {
  constructor(private readonly beatmap: StandardBeatmap) {}

  private readonly converted = new Beatmap({
    id: '',
    setId: '',
    audioFilename: '',
    colors: [],
    bookmarks: [],
    backgroundPath: '',
    general: {
      stackLeniency: 0.7,
    },
    difficulty: {
      hpDrainRate: 5,
      circleSize: 5,
      overallDifficulty: 5,
      approachRate: 5,
      sliderMultiplier: 1,
      sliderTickRate: 1,
    },
    hitObjects: [],
    hitSounds: { layers: defaultHitSoundLayers() },
    name: '',
    metadata: {
      tags: '',
      artist: '',
      title: '',
      beatmapId: -1,
      beatmapSetId: -1,
    },
    controlPoints: { controlPoints: [] },
    previewTime: null,
  });

  convert() {
    this.convertGeneral();
    this.convertMetadata();
    this.convertDifficulty();
    this.convertColors();
    this.convertEvents();
    this.convertBookmarks();
    this.convertHitObjects();
    this.convertControlPoints();
    this.convertHitSounds();
    return this.converted;
  }

  private convertGeneral() {
    const { beatmap, converted } = this;
    converted.general.stackLeniency = beatmap.general.stackLeniency;
    converted.audioFilename = beatmap.general.audioFilename;
    converted.previewTime = beatmap.general.previewTime;
  }

  private convertMetadata() {
    const { beatmap, converted } = this;
    converted.name = beatmap.metadata.version;
    converted.metadata.artist = beatmap.metadata.artist;
    converted.metadata.title = beatmap.metadata.title;
    converted.metadata.beatmapId = beatmap.metadata.beatmapId;
    converted.metadata.beatmapSetId = beatmap.metadata.beatmapSetId;
  }

  private convertDifficulty() {
    const { beatmap, converted } = this;

    const {
      overallDifficulty,
      approachRate,
      sliderMultiplier,
      sliderTickRate,
      circleSize,
      drainRate,
    } = beatmap.difficulty;

    converted.difficulty = {
      overallDifficulty,
      approachRate,
      sliderMultiplier,
      sliderTickRate,
      hpDrainRate: drainRate,
      circleSize,
    };
  }

  private convertColors() {
    const { beatmap, converted } = this;
    converted.colors = beatmap.colors.comboColors.map((color) =>
      parseInt(color.hex.slice(1), 16),
    );
  }

  private convertBookmarks() {
    const { beatmap, converted } = this;
    converted.bookmarks = beatmap.editor.bookmarks.map((bookmark) => {
      return new EditorBookmark({
        time: bookmark,
        name: null,
      });
    });
  }

  private convertEvents() {
    const { beatmap, converted } = this;
    if (beatmap.events.backgroundPath) {
      converted.backgroundPath = beatmap.events.backgroundPath;
    }
  }

  private convertHitObjects() {
    const { beatmap, converted } = this;
    for (const hitObject of beatmap.hitObjects) {
      const hitSound = this.convertHitSound(hitObject.samples);

      if (hitObject instanceof OsuCircle) {
        converted.hitObjects.add(
          new HitCircle({
            type: 'circle',
            startTime: hitObject.startTime,
            position: {
              x: hitObject.startPosition.x,
              y: hitObject.startPosition.y,
            },
            newCombo: hitObject.isNewCombo,
            comboOffset: hitObject.comboOffset,
            hitSound,
          }),
        );
      } else if (hitObject instanceof OsuSlider) {
        converted.hitObjects.add(
          new Slider({
            type: 'slider',
            startTime: hitObject.startTime,
            position: {
              x: hitObject.startPosition.x,
              y: hitObject.startPosition.y,
            },
            newCombo: hitObject.isNewCombo,
            path: hitObject.path.controlPoints.map(this.convertPathPoint),
            expectedDistance: hitObject.path.expectedDistance,
            repeats: hitObject.repeats,
            comboOffset: hitObject.comboOffset,
            velocity: null,
            hitSound,
            hitSounds: hitObject.nodeSamples.map((s) =>
              this.convertHitSound(s),
            ),
          }),
        );
      } else if (hitObject instanceof OsuSpinner) {
        converted.hitObjects.add(
          new Spinner({
            type: 'spinner',
            startTime: hitObject.startTime,
            position: {
              x: hitObject.startPosition.x,
              y: hitObject.startPosition.y,
            },
            newCombo: hitObject.isNewCombo,
            duration: hitObject.duration,
            comboOffset: hitObject.comboOffset,
            hitSound,
          }),
        );
      }
    }
  }

  private convertPathPoint(point: PathPoint): SerializedPathPoint {
    let type: PathType | null = null;
    switch (point.type) {
      case 'L':
        type = PathType.Linear;
        break;
      case 'P':
        type = PathType.PerfectCurve;
        break;
      case 'C':
        type = PathType.Catmull;
        break;
      case 'B':
        type = PathType.Bezier;
        break;
    }
    return {
      x: point.position.x,
      y: point.position.y,
      type,
    };
  }

  private convertControlPoints() {
    const { beatmap, converted } = this;

    const map = new Map<number, ControlPoint>();

    for (const timingPoint of beatmap.controlPoints.timingPoints) {
      const controlPoint = new ControlPoint({
        id: hitObjectId(),
        time: timingPoint.startTime,
        timing: {
          beatLength: timingPoint.beatLength,
        },
        velocityMultiplier: null,
      });
      map.set(timingPoint.startTime, controlPoint);

      converted.controlPoints.add(controlPoint);
    }

    for (const difficultyPoint of beatmap.controlPoints.difficultyPoints) {
      let controlPoint = map.get(difficultyPoint.startTime);

      if (!controlPoint) {
        controlPoint = new ControlPoint({
          id: hitObjectId(),
          time: difficultyPoint.startTime,
          timing: null,
          velocityMultiplier: difficultyPoint.sliderVelocity,
        });
      }

      converted.controlPoints.add(controlPoint);
    }
  }

  private convertHitSound(samples: HitSample[]) {
    const hitSound = defaultHitSound();
    for (const sample of samples) {
      if (sample.hitSound === 'Normal') {
        switch (sample.sampleSet) {
          case 'Drum':
            hitSound.sampleSet = SampleSet.Drum;
            break;
          case 'Normal':
            hitSound.sampleSet = SampleSet.Normal;
            break;
          case 'Soft':
            hitSound.sampleSet = SampleSet.Soft;
            break;
        }
      } else {
        switch (sample.sampleSet) {
          case 'Drum':
            hitSound.additionSet = SampleSet.Drum;
            break;
          case 'Normal':
            hitSound.additionSet = SampleSet.Normal;
            break;
          case 'Soft':
            hitSound.additionSet = SampleSet.Soft;
            break;
        }
        switch (sample.hitSound) {
          case 'Whistle':
            hitSound.additions |= Additions.Whistle;
            break;
          case 'Finish':
            hitSound.additions |= Additions.Finish;
            break;
          case 'Clap':
            hitSound.additions |= Additions.Clap;
            break;
        }
      }
    }
    return hitSound;
  }

  private convertHitSounds() {
    const { beatmap, converted } = this;

    function getLayer(
      sample: HitSample,
      time: number,
    ): HitSoundLayer | undefined {
      let type: SampleType | undefined = undefined;

      switch (sample.hitSound) {
        case 'Normal':
          type = SampleType.Normal;
          break;
        case 'Whistle':
          type = SampleType.Whistle;
          break;
        case 'Clap':
          type = SampleType.Clap;
          break;
        case 'Finish':
          type = SampleType.Finish;
          break;
      }

      let sampleSet: SampleSet | undefined = undefined;

      let s = sample.sampleSet;
      if (s === 'None')
        s = beatmap.controlPoints.samplePointAt(time + 5).sampleSet;
      if (s === 'None') {
        switch (beatmap.general.sampleSet) {
          case 0:
            s = 'Soft';
            break;
          case 1:
            s = 'Normal';
            break;
          case 2:
            s = 'Soft';
            break;
          case 3:
            s = 'Drum';
            break;
        }
      }

      switch (s) {
        case 'Normal':
          sampleSet = SampleSet.Normal;
          break;
        case 'Soft':
          sampleSet = SampleSet.Soft;
          break;
        case 'Drum':
          sampleSet = SampleSet.Drum;
          break;
      }

      if (type === undefined || sampleSet === undefined) return undefined;

      return converted.hitSounds.layers.find(
        (it) => it.sampleSet === sampleSet && it.type === type,
      );
    }

    for (const hitObject of beatmap.hitObjects) {
      if (hitObject instanceof OsuCircle) {
        for (const sample of hitObject.samples) {
          const layer = getLayer(sample, hitObject.startTime);
          if (layer)
            layer.samples.push(
              new HitSoundSample({
                time: hitObject.startTime,
                id: hitObjectId(),
              }),
            );
        }
      } else if (hitObject instanceof OsuSlider) {
        for (let i = 0; i < hitObject.nodeSamples.length; i++) {
          const time = hitObject.startTime + i * hitObject.spanDuration;
          for (const sample of hitObject.nodeSamples[i]) {
            const layer = getLayer(sample, time);
            if (layer)
              layer.samples.push(
                new HitSoundSample({
                  time,
                  id: hitObjectId(),
                }),
              );
          }
        }
      }
    }
  }
}
