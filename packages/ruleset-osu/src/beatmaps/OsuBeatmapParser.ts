import type { Beatmap, HitObject, RulesetBeatmapParser, SampleAdditions } from "@osucad/core";
import { HitSoundInfo, HitType, SampleSet } from "@osucad/core";
import { Vec2 } from "@osucad/framework";
import { HitCircle } from "../hitObjects/HitCircle";
import { PathPoint, PathType } from "../hitObjects/PathPoint";
import { Slider } from "../hitObjects/Slider";
import { Spinner } from "../hitObjects/Spinner";

export class OsuBeatmapParser implements RulesetBeatmapParser
{
  parseHitObject(line: string, beatmap: Beatmap): HitObject | null
  {
    const values = line.split(",");
    if (values.length < 4)
      return null;

    const x = Number.parseInt(values[0]);
    const y = Number.parseInt(values[1]);
    const startTime = Number.parseFloat(values[2]);
    const type = Number.parseInt(values[3]);
    const newCombo = !!(type & HitType.NewCombo);
    const comboOffset = (type & HitType.ComboOffset) >> 4;

    const additions: SampleAdditions = Number.parseInt(values[4]);

    const hitSound = parseHitSound(values[5], additions, startTime, beatmap);

    if (type & HitType.Normal)
    {
      return new HitCircle({
        startTime,
        position: { x, y },
        newCombo,
        comboOffset,
        hitSound,
      });
    }

    if (type & HitType.Slider)
    {
      const spanCount = Number.parseInt(values[6]);

      return new Slider({
        startTime,
        position: { x, y },
        newCombo,
        comboOffset,
        controlPoints: parseControlPoints(Vec2.from({ x, y }), values[5]),
        repeatCount: spanCount - 1,
        expectedDistance: Number.parseFloat(values[7]),
        hitSound,
        nodeSamples: parseSliderNodeSamples(hitSound, values[8], values[9], spanCount),
      });
    }

    if (type & HitType.Spinner)
    {
      const duration = Number.parseFloat(values[5]) - startTime;

      return new Spinner({
        startTime,
        position: { x, y }, // TODO: is this actually needed?
        newCombo,
        comboOffset,
        duration,
        hitSound,
      });
    }

    return null;
  }
}

function parseControlPoints(basePosition: Vec2, pathString: string): PathPoint[]
{
  const [pathTypeLetter, ...pathPoints] = pathString.split("|");

  const pathType = parsePathType(pathTypeLetter);

  const path: PathPoint[] = [
    new PathPoint(Vec2.zero(), pathType),
  ];

  for (const p of pathPoints)
  {
    const [x, y] = p.split(":").map(it => Number.parseFloat(it));
    const position = new Vec2(x, y).sub(basePosition);

    const lastPoint = path[path.length - 1];

    if (position.equals(lastPoint.position))
    {
      path.pop();
      path.push(new PathPoint(position, PathType.Bezier));
      continue;
    }

    path.push(new PathPoint(position));
  }

  return path;
}

function parsePathType(pathTypeLetter: string)
{
  switch (pathTypeLetter)
  {
  case "B":
    return PathType.Bezier;
  case "C":
    return PathType.Catmull;
  case "L":
    return PathType.Linear;
  case "P":
    return PathType.PerfectCurve;
  default:
    throw new Error(`Unknown path type: ${pathTypeLetter}`);
  }
}

function parseHitSound(str: string, additions: SampleAdditions, time: number, beatmap: Beatmap): HitSoundInfo
{
  const sampleInfo = beatmap.timing.getSampleInfoAt(time);

  if (str.length === 0)
    return new HitSoundInfo(sampleInfo.sampleSet, sampleInfo.sampleSet, additions);

  const values = str.split(":");

  let sampleSet = Number.parseInt(values[0]);
  if (!(sampleSet in SampleSet))
    sampleSet = SampleSet.Normal;

  let addSampleSet = Number.parseInt(values[1]);
  if (!(addSampleSet in SampleSet))
    addSampleSet = SampleSet.Normal;


  return new HitSoundInfo(sampleSet, addSampleSet, additions);
}

function parseSliderNodeSamples(hitSound: HitSoundInfo, edgeSoundsString: string | undefined, edgeSetsString: string | undefined, spanCount: number): HitSoundInfo[]
{
  const samples: HitSoundInfo[] = [];

  const edgeSounds = edgeSoundsString?.split("|").map(s => Number.parseInt(s) as SampleAdditions) ?? [];

  const edgeSets = edgeSetsString?.split("|").map(s =>
  {
    const [normalSet, additionSet] = s.split(":");

    return {
      normalSet: Number.parseInt(normalSet) as SampleSet,
      additionSet: Number.parseInt(additionSet) as SampleSet,
    };
  }) ?? [];

  for (let i = 0; i <= spanCount; i++)
  {
    const additions = edgeSounds[i] ?? hitSound.additions;

    const edgeSet = edgeSets[i];
    const sampleSet = edgeSet?.normalSet ?? hitSound.sampleSet;
    const additionSet = edgeSet?.additionSet ?? hitSound.additionSampleSet;

    samples.push(new HitSoundInfo(sampleSet, additionSet, additions));
  }

  return samples;
}
