import { Beatmap, HitObject, HitType, RulesetBeatmapParser } from "@osucad/core";
import { Vec2 } from "@osucad/framework";
import { HitCircle } from "../hitObjects/HitCircle";
import { PathPoint, PathType } from "../hitObjects/PathPoint";
import { Slider } from "../hitObjects/Slider";

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

    if (type & HitType.Normal) 
    {
      return new HitCircle({
        startTime,
        position: { x, y },
        newCombo,
        comboOffset,
        // TODO: HitSound
      });
    }

    if (type & HitType.Slider) 
    {
      return new Slider({
        startTime,
        position: { x, y },
        newCombo,
        comboOffset,
        controlPoints: parseControlPoints(Vec2.from({ x, y }), values[5]),
        repeatCount: Number.parseInt(values[6]) - 1,
        expectedDistance: Number.parseFloat(values[7]),
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
