import type { OsuHitObject } from '../../rulesets/osu/hitObjects/OsuHitObject';
import { Vec2 } from 'osucad-framework';
import { Color } from 'pixi.js';
import { DifficultyPoint } from '../../controlPoints/DifficultyPoint';
import { EffectPoint } from '../../controlPoints/EffectPoint';
import { SamplePoint } from '../../controlPoints/SamplePoint';
import { TimingPoint } from '../../controlPoints/TimingPoint';
import { EffectType } from '../../hitObjects/EffectType';
import { HitType } from '../../hitObjects/HitType';
import { Additions } from '../../hitsounds/Additions';
import { HitSound } from '../../hitsounds/HitSound';
import { SampleSet } from '../../hitsounds/SampleSet';
import { HitCircle } from '../../rulesets/osu/hitObjects/HitCircle';
import { PathPoint } from '../../rulesets/osu/hitObjects/PathPoint';
import { PathType } from '../../rulesets/osu/hitObjects/PathType';
import { Slider } from '../../rulesets/osu/hitObjects/Slider';
import { SliderPathBuilder } from '../../rulesets/osu/hitObjects/SliderPathBuilder';
import { Spinner } from '../../rulesets/osu/hitObjects/Spinner';
import { Beatmap } from '../Beatmap';

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
  parse(fileContent: string, options: ParseBeatmapOptions = {}): Beatmap {
    const lines = fileContent.split('\n').map(it => it.trim());

    let currentSection: BeatmapSection | null = null;

    const versionHeader = lines.shift();
    if (!versionHeader)
      throw new Error('Invalid beatmap file');

    const version = versionHeader.match(/osu file format v(\d+)/)?.[1];
    if (!version) {
      throw new Error('Invalid beatmap file. Could not find version header.');
    }

    const beatmap = new Beatmap();

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

  #parseLine(beatmap: Beatmap, section: BeatmapSection, line: string, options: ParseBeatmapOptions) {
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

  #parseMetadata(beatmap: Beatmap, line: string) {
    const [key, value] = line.split(':').map(it => it.trim());

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
        beatmap.metadata.difficultyName = value;
        break;
      case 'Source':
        beatmap.metadata.source = value;
        break;
      case 'Tags':
        beatmap.metadata.tags = value;
        break;
      case 'BeatmapID':
        beatmap.metadata.osuWebId = Number.parseInt(value);
        break;
      case 'BeatmapSetID':
        beatmap.metadata.osuWebSetId = Number.parseInt(value);
        break;
    }
  }

  #parseGeneral(beatmap: Beatmap, line: string) {
    const [key, value] = line.split(':').map(it => it.trim());

    switch (key) {
      case 'AudioFilename':
        beatmap.settings.audioFileName = value;
        break;
      case 'AudioLeadIn':
        beatmap.settings.audioLeadIn = Number.parseInt(value);
        break;
      case 'AudioHash':
        beatmap.settings.audioHash = value;
        break;
      case 'PreviewTime':
        beatmap.settings.previewTime = Number.parseInt(value);
        break;
      case 'Countdown':
        beatmap.settings.countdown = Number.parseInt(value);
        break;
      case 'SampleSet':
        beatmap.settings.sampleSet = value;
        break;
      case 'StackLeniency':
        beatmap.settings.stackLeniency = Number.parseFloat(value);
        break;
      case 'Mode':
        beatmap.settings.mode = Number.parseInt(value);
        break;
      case 'LetterboxInBreaks':
        beatmap.settings.letterboxInBreaks = value === '1';
        break;
      case 'UseSkinSprites':
        beatmap.settings.useSkinSprites = value === '1';
        break;
      case 'AlwaysShowPlayfield':
        beatmap.settings.alwaysShowPlayfield = value === '1';
        break;
      case 'OverlayPosition':
        beatmap.settings.overlayPosition = value;
        break;
      case 'SkinPreference':
        beatmap.settings.skinPreference = value;
        break;
      case 'EpilepsyWarning':
        beatmap.settings.epilepsyWarning = value === '1';
        break;
      case 'CountdownOffset':
        beatmap.settings.countdownOffset = Number.parseInt(value);
        break;
      case 'SpecialStyle':
        beatmap.settings.specialStyle = value === '1';
        break;
      case 'WidescreenStoryboard':
        beatmap.settings.widescreenStoryboard = value === '1';
        break;
      case 'SamplesMatchPlaybackRate':
        beatmap.settings.samplesMatchPlaybackRate = value === '1';
        break;
    }
  }

  #parseEditor(beatmap: Beatmap, line: string) {
    const [key, value] = line.split(':').map(it => it.trim());

    switch (key) {
      case 'Bookmarks':
        beatmap.settings.editor.bookmarks = value.split(',').map(it => Number.parseInt(it));
        break;
      case 'DistanceSpacing':
        beatmap.settings.editor.distanceSpacing = Number.parseFloat(value);
        break;
      case 'BeatDivisor':
        beatmap.settings.editor.beatDivisor = Number.parseInt(value);
        break;
      case 'GridSize':
        beatmap.settings.editor.gridSize = Number.parseInt(value);
        break;
      case 'TimelineZoom':
        beatmap.settings.editor.timelineZoom.value = Number.parseFloat(value);
        break;
    }
  }

  #parseTimingPoints(beatmap: Beatmap, line: string) {
    const values = line.split(',');
    if (values.length <= 1)
      return;

    const uninherited = values[6] === '1';

    const startTime = Number.parseInt(values[0]);

    const group = beatmap.controlPoints.controlPointGroupAtTime(startTime, true);

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

    beatmap.controlPoints.addToGroup(group, new SamplePoint(volume, sampleSet, sampleIndex), true);

    const effectFlags = Number.parseInt(values[7]);

    const kiaiMode = !!(effectFlags & EffectType.Kiai);

    beatmap.controlPoints.addToGroup(group, new EffectPoint(kiaiMode), true);

    if (uninherited) {
      const beatLength = Number.parseFloat(values[1]);
      const meter = Number.parseInt(values[2]);

      group.add(new TimingPoint(beatLength, meter));
      group.add(new DifficultyPoint(1));
    }
    else {
      const sliderVelocity = -100 / Number.parseFloat(values[1]);

      beatmap.controlPoints.addToGroup(group, new DifficultyPoint(sliderVelocity), true);
    }
  }

  #parseHitObject(beatmap: Beatmap, line: string) {
    const values = line.split(',');

    const x = Number.parseInt(values[0]);
    const y = Number.parseInt(values[1]);
    const startTime = Number.parseFloat(values[2]);
    const type = Number.parseInt(values[3]);
    const newCombo = !!(type & HitType.NewCombo);

    const comboOffset = (type & HitType.ComboOffset) >> 4;

    let hitObject: OsuHitObject | undefined;

    function parseHitSound(index: number) {
      const samples = (values[index] ?? '0:0:0:0:').split(':');
      const [sampleSet, additionSampleSet] = samples.slice(0, 4).map(it => Number.parseInt(it));

      const additions = (Number.parseInt(values[4]) >> 1) as Additions;

      return new HitSound(sampleSet, additionSampleSet, additions);
    }

    if (type & HitType.Normal) {
      const circle = hitObject = new HitCircle();
      circle.position = new Vec2(x, y);
      circle.startTime = startTime;
      circle.newCombo = newCombo;
      circle.comboOffset = comboOffset;
      circle.hitSound = parseHitSound(5);
    }
    else if (type & HitType.Slider) {
      const slider = hitObject = new Slider();
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

      const edgeSounds = values[8]?.split('|').map(it => Number.parseInt(it) >> 1) ?? Array.from({ length: slider.spanCount + 1 }, () => hitSound.additions);
      const edgeSets = values[9]?.split('|').map((it) => {
        const [normalSet, additionSet] = it.split(':');
        return {
          normalSet: Number.parseInt(normalSet),
          additionSet: Number.parseInt(additionSet),
        };
      }) ?? Array.from({ length: slider.spanCount + 1 }, () => ({
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

      slider.ensureHitSoundsAreValid();
    }
    else if (type & HitType.Spinner) {
      const spinner = hitObject = new Spinner();
      spinner.startTime = startTime;
      spinner.duration = Number.parseFloat(values[5]) - startTime;
      spinner.newCombo = newCombo;
      spinner.position = new Vec2(x, y);

      spinner.hitSound = parseHitSound(6);
    }

    if (!hitObject)
      return;

    beatmap.hitObjects.add(hitObject);
  }

  #parseDifficulty(beatmap: Beatmap, line: string) {
    const [key, value] = line.split(':').map(it => it.trim());

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

  #parseColors(beatmap: Beatmap, line: string) {
    const [key, value] = line.split(':').map(it => it.trim());

    if (key.startsWith('Combo')) {
      const [r, g, b] = value.split(',').map(it => Number.parseInt(it));

      beatmap.colors.addComboColor(new Color({ r, g, b }));
    }
  }

  #parseEvents(beatmap: Beatmap, line: string) {
    if (line.startsWith('0,0,')) {
      const filename = line.split(',')[2];

      beatmap.settings.backgroundFilename = filename.slice(1, -1);
    }
  }
}
