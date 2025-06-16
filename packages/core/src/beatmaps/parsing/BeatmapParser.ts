import { Color } from "pixi.js";
import type { HitObject } from "../../rulesets/hitObjects/HitObject";
import type { RulesetStore } from "../../rulesets/RulesetStore";
import { rulesets } from "../../rulesets/RulesetStore";
import { nn } from "../../utils/nn";
import { Beatmap } from "../Beatmap";
import { LegacyTimingPoint } from "../timing/LegacyTimingPoint";
import { SampleSet } from "../../audio/SampleSet";

export interface BeatmapParserOptions
{
  rulesetStore?: RulesetStore
}

export interface RulesetBeatmapParser
{
  createBeatmap?(): Beatmap;

  parseHitObject(line: string, beatmap: Beatmap): HitObject | null;
}

enum BeatmapSection
{
  General = "General",
  Editor = "Editor",
  Metadata = "Metadata",
  Difficulty = "Difficulty",
  Events = "Events",
  TimingPoints = "TimingPoints",
  Colours = "Colours",
  HitObjects = "HitObjects",
}

export class BeatmapParser
{
  rulesetStore: RulesetStore;

  constructor(
    options: BeatmapParserOptions = {},
  )
  {
    this.rulesetStore = options.rulesetStore ?? rulesets;
  }

  async parse(content: string | string[])
  {
    const lines = typeof content === "string"
        ? content.split(/\r?\n/)
        : content;

    const fileVersion = parseVersionHeader(lines.shift() ?? "");
    console.debug(`Parsing beatmap from .osu content (Format version ${fileVersion})`);

    let currentSection: BeatmapSection | null = null;
    let rulesetParser: RulesetBeatmapParser | null = null;

    const beatmap = new Beatmap();

    const getRuleset = () =>
    {
      if (!beatmap.beatmapInfo.ruleset)
        throw new Error("No ruleset" /* TODO: better error message */);
      return beatmap.beatmapInfo.ruleset;
    };

    const getRulesetParser = async (): Promise<RulesetBeatmapParser> =>
    {
      return nn(
          await getRuleset().createBeatmapParser?.(),
          `Parsing not supported for "${getRuleset().title}" ruleset`,
      );
    };

    for (const line of lines)
    {
      const newSection = tryParseSectionHeader(line);
      if (newSection)
      {
        currentSection = newSection;
        continue;
      }

      switch (currentSection)
      {
      case BeatmapSection.General:
        parseGeneral(line, beatmap);
        break;
      case BeatmapSection.Metadata:
        parseMetadata(line, beatmap);
        break;
      case BeatmapSection.Difficulty:
        parseDifficulty(line, beatmap);
        break;
      case BeatmapSection.TimingPoints:
        parseTimingPoint(line, beatmap);
        break;
      case BeatmapSection.Colours:
        parseColors(line, beatmap);
        break;
      case BeatmapSection.HitObjects: {
        const hitObject = (rulesetParser ??= await getRulesetParser()).parseHitObject(line, beatmap);
        if (hitObject)
        {
          hitObject.applyDefaults(beatmap.difficulty, beatmap.timing);
          beatmap.hitObjects.push(hitObject);
        }
        break;
      }
      }
    }

    beatmap.hitObjects.sort((a, b) => a.startTime - b.startTime);

    const postProcessor = await getRuleset().createBeatmapPostProcessor?.();
    if (postProcessor)
      postProcessor.applyToBeatmap(beatmap);

    return beatmap;
  }
}

function parseGeneral(line: string, { beatmapInfo }: Beatmap)
{
  const [key, value] = parseKeyValue(line);

  if (!key || !value)
    return;

  switch (key)
  {
  case "AudioFilename":
    beatmapInfo.audioFile = value;
    break;
  case "AudioLeadIn":
    beatmapInfo.audioLeadIn = Number.parseInt(value);
    break;
  case "AudioHash":
    // TODO
    // beatmapInfo.audioHash = value;
    break;
  case "PreviewTime":
    beatmapInfo.previewTime = Number.parseInt(value);
    break;
  case "Countdown":
    beatmapInfo.countdownType = Number.parseInt(value);
    break;
  case "SampleSet":
    beatmapInfo.sampleSet = value;
    break;
  case "StackLeniency":
    beatmapInfo.stackLeniency = Number.parseFloat(value);
    break;
  case "Mode":
    beatmapInfo.ruleset = nn(
        rulesets.get({ legacyId: Number.parseInt(value) }),
        `No ruleset found for Mode: ${value} `,
    );
    break;
  case "LetterboxInBreaks":
    beatmapInfo.letterboxInBreaks = value === "1";
    break;
  case "UseSkinSprites":
    beatmapInfo.useSkinSprites = value === "1";
    break;
  case "AlwaysShowPlayfield":
    beatmapInfo.alwaysShowPlayfield = value === "1";
    break;
  case "OverlayPosition":
    beatmapInfo.overlayPosition = value;
    break;
  case "SkinPreference":
    beatmapInfo.skinPreference = value;
    break;
  case "EpilepsyWarning":
    beatmapInfo.epilepsyWarning = value === "1";
    break;
  case "CountdownOffset":
    beatmapInfo.countdownOffset = Number.parseInt(value);
    break;
  case "SpecialStyle":
    beatmapInfo.specialStyle = value === "1";
    break;
  case "WidescreenStoryboard":
    beatmapInfo.widescreenStoryboard = value === "1";
    break;
  case "SamplesMatchPlaybackRate":
    beatmapInfo.samplesMatchingPlaybackRate = value === "1";
    break;
  default:
    console.warn(`Unknown key ${key} in beatmap General section`);
    break;
  }
}

function parseMetadata(line: string, beatmap: Beatmap)
{
  const [key, value] = parseKeyValue(line);

  if (!key || !value)
    return;

  switch (key)
  {
  case "Title":
    beatmap.metadata.title = value;
    break;
  case "TitleUnicode":
    beatmap.metadata.titleUnicode = value;
    break;
  case "Artist":
    beatmap.metadata.artist = value;
    break;
  case "ArtistUnicode":
    beatmap.metadata.artistUnicode = value;
    break;
  case "Creator":
    beatmap.metadata.creator = value;
    break;
  case "Version":
    beatmap.metadata.difficultyName = value;
    break;
  case "Source":
    beatmap.metadata.source = value;
    break;
  case "Tags":
    beatmap.metadata.tags = value;
    break;
  case "BeatmapID":
    beatmap.beatmapInfo.onlineInfo.id = Number.parseInt(value);
    break;
  case "BeatmapSetID":
    beatmap.beatmapInfo.onlineInfo.beatmapSetId = Number.parseInt(value);
    break;
  }
}

function parseDifficulty(line: string, beatmap: Beatmap)
{
  const [key, value] = parseKeyValue(line);

  if (!key || !value)
    return;

  switch (key)
  {
  case "HPDrainRate":
    beatmap.difficulty.drainRate = Number.parseFloat(value);
    break;
  case "CircleSize":
    beatmap.difficulty.circleSize = Number.parseFloat(value);
    break;
  case "OverallDifficulty":
    beatmap.difficulty.overallDifficulty = Number.parseFloat(value);
    break;
  case "ApproachRate":
    beatmap.difficulty.approachRate = Number.parseFloat(value);
    break;
  case "SliderMultiplier":
    beatmap.difficulty.sliderMultiplier = Number.parseFloat(value);
    break;
  case "SliderTickRate":
    beatmap.difficulty.sliderTickRate = Number.parseFloat(value);
    break;
  }
}

function parseTimingPoint(line: string, beatmap: Beatmap)
{
  const values = line.split(",");
  if (values.length <= 1)
    return;

  const uninherited = values[6] === "1";

  const startTime = Number.parseInt(values[0]);

  const timingPoint = new LegacyTimingPoint();
  timingPoint.startTime = startTime;

  timingPoint.sampleSet = SampleSet.Normal;

  if (values.length >= 4)
    timingPoint.sampleSet = Number.parseInt(values[3]);

  if (values.length >= 5)
    timingPoint.sampleIndex = Number.parseInt(values[4]);

  if (values.length >= 6)
    timingPoint.volume = Number.parseInt(values[5]);

  if (uninherited)
  {
    const beatDuration = Number.parseFloat(values[1]);
    const signature = Number.parseInt(values[2]);

    timingPoint.timingInfo = {
      beatLength: beatDuration,
      signature,
    };
  }
  else
  {
    const sliderVelocity = -100 / Number.parseFloat(values[1]);

    timingPoint.sliderVelocity = sliderVelocity;
  }

  beatmap.timing.add(timingPoint);
}

function parseVersionHeader(line: string)
{
  const match = line.match(/osu file format v(\d+)/);

  if (!match)
    return undefined;

  const version = Number.parseInt(match[1]);

  if (Number.isFinite(version))
    return version;

  throw Error(`Invalid version header: ${line}`);
}

function parseColors(line: string, beatmap: Beatmap)
{
  const [key, value] = parseKeyValue(line);

  if (!key || !value)
    return;

  const parseColorValue = () =>
  {
    const [r, g, b] = value.split(",").map(it => Number.parseInt(it));

    return new Color({ r, g, b });
  };

  if (key.startsWith("Combo"))
  {
    beatmap.colors.addComboColor(parseColorValue());
  }
  else
    switch (key)
    {
    case "SliderTrackOverride":
      beatmap.colors.sliderTrackOverride = parseColorValue();
      break;
    case "SliderBorder":
      beatmap.colors.sliderBorder = parseColorValue();
      break;
    }
}

function tryParseSectionHeader(line: string)
{
  if (line.startsWith("[") && line.endsWith("]"))
  {
    const section = line.substring(1, line.length - 1);
    if (section in BeatmapSection)
      return section as BeatmapSection;
  }

  return null;
}

function parseKeyValue(line: string): [string, string] | []
{
  const index = line.indexOf(":");
  if (index === -1)
    return [];

  return [line.slice(0, index).trim(), line.slice(index + 1).trim()];
}
