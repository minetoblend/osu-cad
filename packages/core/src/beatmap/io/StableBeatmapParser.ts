import type { ConvertHitObject } from '../../hitObjects/conversion/ConvertHitObject';
import { Vec2 } from '@osucad/framework';
import { Color } from 'pixi.js';
import { DifficultyPoint } from '../../controlPoints/DifficultyPoint';
import { EffectPoint } from '../../controlPoints/EffectPoint';
import { SamplePoint } from '../../controlPoints/SamplePoint';
import { TimingPoint } from '../../controlPoints/TimingPoint';
import { VolumePoint } from '../../controlPoints/VolumePoint';
import { ConvertCircle } from '../../hitObjects/conversion/ConvertCircle';
import { ConvertHoldNote } from '../../hitObjects/conversion/ConvertHoldNote';
import { ConvertSlider } from '../../hitObjects/conversion/ConvertSlider';
import { ConvertSpinner } from '../../hitObjects/conversion/ConvertSpinner';
import { EffectType } from '../../hitObjects/EffectType';
import { HitType } from '../../hitObjects/HitType';
import { PathPoint } from '../../hitObjects/PathPoint';
import { PathType } from '../../hitObjects/PathType';
import { SliderPathBuilder } from '../../hitObjects/SliderPathBuilder';
import { Additions } from '../../hitsounds/Additions';
import { HitSound } from '../../hitsounds/HitSound';
import { SampleSet } from '../../hitsounds/SampleSet';
import { RulesetInfo } from '../../rulesets/RulesetInfo';
import { RulesetStore } from '../../rulesets/RulesetStore';
import { ConversionBeatmap } from '../ConversionBeatmap';

enum BeatmapSection {
  General = 'General',
  Editor = 'Editor',
  Metadata = 'Metadata',
  Difficulty = 'Difficulty',
  Events = 'Events',
  TimingPoints = 'TimingPoints',
  Colours = 'Colours',
  HitObjects = 'HitObjects',
}

export interface ParseBeatmapOptions {
  hitObjects?: boolean;
  timingPoints?: boolean;
}

export class StableBeatmapParser {
  parse(fileContent: string, options: ParseBeatmapOptions = {}): ConversionBeatmap {
    const lines = fileContent.split('\n').map(it => it.trim());

    let currentSection: BeatmapSection | null = null;

    const versionHeader = lines.shift();
    if (!versionHeader)
      throw new Error('Invalid beatmap file');

    const version = versionHeader.match(/osu file format v(\d+)/)?.[1];
    if (!version) {
      throw new Error('Invalid beatmap file. Could not find version header.');
    }

    const beatmap = new ConversionBeatmap();

    for (const line of lines) {
      const newSection = this.#tryParseSectionHeader(line);
      if (newSection) {
        currentSection = newSection;
        continue;
      }

      if (currentSection) {
        this.#parseLine(beatmap, currentSection, line, options);
      }
    }

    return beatmap;
  }

  #tryParseSectionHeader(line: string): BeatmapSection | null {
    if (line.startsWith('[') && line.endsWith(']')) {
      const section = line.substring(1, line.length - 1);
      if (section in BeatmapSection) {
        return section as BeatmapSection;
      }
    }
    return null;
  }

  #parseLine(beatmap: ConversionBeatmap, section: BeatmapSection, line: string, options: ParseBeatmapOptions) {
    switch (section) {
      case BeatmapSection.General:
        this.#parseGeneral(beatmap, line);
        break;
      case BeatmapSection.Metadata:
        this.#parseMetadata(beatmap, line);
        break;
      case BeatmapSection.Editor:
        this.#parseEditor(beatmap, line);
        break;
      case BeatmapSection.Difficulty:
        this.#parseDifficulty(beatmap, line);
        break;
      case BeatmapSection.TimingPoints:
        if (options.timingPoints === false)
          return;
        this.#parseTimingPoints(beatmap, line);
        break;
      case BeatmapSection.Colours:
        this.#parseColors(beatmap, line);
        break;
      case BeatmapSection.Events:
        this.#parseEvents(beatmap, line);
        break;
      case BeatmapSection.HitObjects:
        if (options.hitObjects === false)
          return;
        this.#parseHitObject(beatmap, line);
        break;
    }
  }

  #parseKeyValue(line: string): [string, string] | [] {
    const index = line.indexOf(':');
    if (index === -1)
      return [];

    return [line.slice(0, index).trim(), line.slice(index + 1).trim()];
  }

  #parseMetadata(beatmap: ConversionBeatmap, line: string) {
    const [key, value] = this.#parseKeyValue(line);

    if (!key || !value)
      return;

    switch (key) {
      case 'Title':
        beatmap.metadata.title = value;
        break;
      case 'TitleUnicode':
        beatmap.metadata.titleUnicode = value;
        break;
      case 'Artist':
        beatmap.metadata.artist = value;
        break;
      case 'ArtistUnicode':
        beatmap.metadata.artistUnicode = value;
        break;
      case 'Creator':
        beatmap.metadata.creator = value;
        break;
      case 'Version':
        beatmap.beatmapInfo.difficultyName = value;
        break;
      case 'Source':
        beatmap.metadata.source = value;
        break;
      case 'Tags':
        beatmap.metadata.tags = value;
        break;
      case 'BeatmapID':
        beatmap.beatmapInfo.onlineId = Number.parseInt(value);
        break;
      case 'BeatmapSetID':
        beatmap.beatmapInfo.onlineBeatmapSetId = Number.parseInt(value);
        break;
    }
  }

  #parseGeneral(beatmap: ConversionBeatmap, line: string) {
    const [key, value] = this.#parseKeyValue(line);

    if (!key || !value)
      return;

    switch (key) {
      case 'AudioFilename':
        beatmap.metadata.audioFile = value;
        break;
      case 'AudioLeadIn':
        beatmap.beatmapInfo.audioLeadIn = Number.parseInt(value);
        break;
      case 'AudioHash':
        // TODO
        // beatmap.beatmapInfo.audioHash = value;
        break;
      case 'PreviewTime':
        beatmap.metadata.previewTime = Number.parseInt(value);
        break;
      case 'Countdown':
        beatmap.beatmapInfo.countdownType = Number.parseInt(value);
        break;
      case 'SampleSet':
        // TODO
        // beatmap.beatmapInfo.sampleSet = value;
        break;
      case 'StackLeniency':
        beatmap.beatmapInfo.stackLeniency = Number.parseFloat(value);
        break;
      case 'Mode':
        beatmap.beatmapInfo.ruleset = RulesetStore.getByLegacyId(Number.parseInt(value)) ?? new RulesetInfo();
        break;
      case 'LetterboxInBreaks':
        beatmap.beatmapInfo.letterboxInBreaks = value === '1';
        break;
      case 'UseSkinSprites':
        beatmap.beatmapInfo.useSkinSprites = value === '1';
        break;
      case 'AlwaysShowPlayfield':
        beatmap.beatmapInfo.alwaysShowPlayfield = value === '1';
        break;
      case 'OverlayPosition':
        beatmap.beatmapInfo.overlayPosition = value;
        break;
      case 'SkinPreference':
        beatmap.beatmapInfo.skinPreference = value;
        break;
      case 'EpilepsyWarning':
        beatmap.beatmapInfo.epilepsyWarning = value === '1';
        break;
      case 'CountdownOffset':
        beatmap.beatmapInfo.countdownOffset = Number.parseInt(value);
        break;
      case 'SpecialStyle':
        beatmap.beatmapInfo.specialStyle = value === '1';
        break;
      case 'WidescreenStoryboard':
        beatmap.beatmapInfo.widescreenStoryboard = value === '1';
        break;
      case 'SamplesMatchPlaybackRate':
        beatmap.beatmapInfo.samplesMatchingPlaybackRate = value === '1';
        break;
    }
  }

  #parseEditor(beatmap: ConversionBeatmap, line: string) {
    const [key, value] = this.#parseKeyValue(line);

    if (!key || !value)
      return;

    switch (key) {
      case 'Bookmarks':
        beatmap.beatmapInfo.bookmarks = value.split(',').map(it => Number.parseInt(it));
        break;
      case 'DistanceSpacing':
        beatmap.beatmapInfo.distanceSpacing = Number.parseFloat(value);
        break;
      case 'BeatDivisor':
        beatmap.beatmapInfo.beatDivisor = Number.parseInt(value);
        break;
      case 'GridSize':
        beatmap.beatmapInfo.gridSize = Number.parseInt(value);
        break;
      case 'TimelineZoom':
        beatmap.beatmapInfo.timelineZoom = Number.parseFloat(value);
        break;
    }
  }

  #parseTimingPoints(beatmap: ConversionBeatmap, line: string) {
    const values = line.split(',');
    if (values.length <= 1)
      return;

    const uninherited = values[6] === '1';

    const startTime = Number.parseInt(values[0]);

    const volume = Number.parseInt(values[5]);

    let sampleSet = SampleSet.Auto;
    switch (values[3]) {
      case '1':
        sampleSet = SampleSet.Normal;
        break;
      case '2':
        sampleSet = SampleSet.Soft;
        break;
      case '3':
        sampleSet = SampleSet.Drum;
    }

    const sampleIndex = Number.parseInt(values[4]);

    const samplePoint = beatmap.controlPoints.samplePoints.controlPointAtTimeExact(startTime);
    if (samplePoint)
      beatmap.controlPoints.remove(samplePoint);

    beatmap.controlPoints.add(new SamplePoint(startTime, volume, sampleSet, sampleIndex), true);

    const volumePoint = beatmap.controlPoints.volumePoints.controlPointAtTimeExact(startTime);
    if (volumePoint)
      beatmap.controlPoints.remove(volumePoint);

    beatmap.controlPoints.add(new VolumePoint(startTime, volume), true);

    const effectFlags = Number.parseInt(values[7]);

    const kiaiMode = !!(effectFlags & EffectType.Kiai);

    beatmap.controlPoints.add(new EffectPoint(startTime, kiaiMode), true);

    if (uninherited) {
      const beatLength = Number.parseFloat(values[1]);
      const meter = Number.parseInt(values[2]);

      beatmap.controlPoints.add(new TimingPoint(startTime, beatLength, meter));
      beatmap.controlPoints.add(new DifficultyPoint(startTime, 1));
    }
    else {
      const sliderVelocity = -100 / Number.parseFloat(values[1]);

      const existing = beatmap.controlPoints
        .difficultyPoints
        .controlPointAtTimeExact(startTime);
      if (existing)
        beatmap.controlPoints.remove(existing);

      beatmap.controlPoints.add(new DifficultyPoint(startTime, sliderVelocity), true);
    }
  }

  #parseHitObject(beatmap: ConversionBeatmap, line: string) {
    const values = line.split(',');

    const x = Number.parseInt(values[0]);
    const y = Number.parseInt(values[1]);
    const startTime = Number.parseFloat(values[2]);
    const type = Number.parseInt(values[3]);
    const newCombo = !!(type & HitType.NewCombo);

    const comboOffset = (type & HitType.ComboOffset) >> 4;

    let hitObject: ConvertHitObject | undefined;

    function parseHitSound(index: number) {
      const samples = (values[index] ?? '0:0:0:0:').split(':');
      const [sampleSet, additionSampleSet] = samples.slice(0, 4).map(it => Number.parseInt(it));

      const additions = (Number.parseInt(values[4]) >> 1) as Additions;

      return new HitSound(sampleSet, additionSampleSet, additions);
    }

    if (type & HitType.Normal) {
      const circle = hitObject = new ConvertCircle();
      circle.position = new Vec2(x, y);
      circle.startTime = startTime;
      circle.newCombo = newCombo;
      circle.comboOffset = comboOffset;
      circle.hitSound = parseHitSound(5);
    }
    else if (type & HitType.Slider) {
      const slider = hitObject = new ConvertSlider();
      slider.position = new Vec2(x, y);
      slider.startTime = startTime;
      slider.newCombo = newCombo;
      slider.comboOffset = comboOffset;

      const pathString = values[5];
      const [pathTypeLetter, ...pathPoints] = pathString.split('|');

      let pathType: PathType;
      switch (pathTypeLetter) {
        case 'B':
          pathType = PathType.Bezier;
          break;
        case 'C':
          pathType = PathType.Catmull;
          break;
        case 'L':
          pathType = PathType.Linear;
          break;
        case 'P':
          pathType = PathType.PerfectCurve;
          break;
        default:
          throw new Error(`Unknown path type: ${pathTypeLetter}`);
      }

      const path = new SliderPathBuilder([
        new PathPoint(new Vec2(), pathType),
      ]);

      for (const p of pathPoints) {
        const [x, y] = p.split(':').map(it => Number.parseFloat(it));

        const position = new Vec2(x, y).sub(slider.position);

        if (position.equals(path.get(-1).position)) {
          path.setType(-1, PathType.Bezier);
          continue;
        }

        path.append(new PathPoint(position));
      }

      slider.path.controlPoints = path.controlPoints;
      slider.path.expectedDistance = Number.parseFloat(values[7]);

      slider.repeatCount = Number.parseInt(values[6]) - 1;

      const hitSound = slider.hitSound = parseHitSound(10);

      const edgeSounds = values[8]?.split('|').map(it => Number.parseInt(it) >> 1) ?? Array.from({ length: slider.repeatCount + 2 }, () => hitSound.additions);
      const edgeSets = values[9]?.split('|').map((it) => {
        const [normalSet, additionSet] = it.split(':');
        return {
          normalSet: Number.parseInt(normalSet),
          additionSet: Number.parseInt(additionSet),
        };
      }) ?? Array.from({ length: slider.repeatCount + 2 }, () => ({
        normalSet: hitSound.sampleSet,
        additionSet: hitSound.additionSampleSet,
      }));

      const hitSounds: HitSound[] = [];
      for (let i = 0; i < edgeSets.length; i++) {
        hitSounds.push(new HitSound(
          edgeSets[i]?.normalSet ?? SampleSet.Auto,
          edgeSets[i].additionSet ?? SampleSet.Auto,
          edgeSounds[i] ?? Additions.None,
        ));
      }

      slider.hitSounds = hitSounds;
    }
    else if (type & HitType.Spinner) {
      const spinner = hitObject = new ConvertSpinner();
      spinner.startTime = startTime;
      spinner.duration = Number.parseFloat(values[5]) - startTime;
      spinner.newCombo = newCombo;
      spinner.position = new Vec2(x, y);

      spinner.hitSound = parseHitSound(6);
    }
    else if (type & HitType.Hold) {
      const note = hitObject = new ConvertHoldNote();
      note.startTime = startTime;
      note.endTime = Number.parseFloat(values[5]);
      note.position = new Vec2(x, y);
    }

    if (!hitObject)
      return;

    beatmap.hitObjects.add(hitObject);
  }

  #parseDifficulty(beatmap: ConversionBeatmap, line: string) {
    const [key, value] = this.#parseKeyValue(line);

    if (!key || !value)
      return;

    switch (key) {
      case 'HPDrainRate':
        beatmap.difficulty.hpDrainRate = Number.parseFloat(value);
        break;
      case 'CircleSize':
        beatmap.difficulty.circleSize = Number.parseFloat(value);
        break;
      case 'OverallDifficulty':
        beatmap.difficulty.overallDifficulty = Number.parseFloat(value);
        break;
      case 'ApproachRate':
        beatmap.difficulty.approachRate = Number.parseFloat(value);
        break;
      case 'SliderMultiplier':
        beatmap.difficulty.sliderMultiplier = Number.parseFloat(value);
        break;
      case 'SliderTickRate':
        beatmap.difficulty.sliderTickRate = Number.parseFloat(value);
        break;
    }
  }

  #parseColors(beatmap: ConversionBeatmap, line: string) {
    const [key, value] = this.#parseKeyValue(line);

    if (!key || !value)
      return;

    if (key.startsWith('Combo')) {
      const [r, g, b] = value.split(',').map(it => Number.parseInt(it));

      beatmap.colors.addComboColor(new Color({ r, g, b }));
    }
  }

  #parseEvents(beatmap: ConversionBeatmap, line: string) {
    if (line.startsWith('0,0,')) {
      const filename = line.split(',')[2];

      beatmap.metadata.backgroundFile = filename.slice(1, -1);
    }
  }
}
