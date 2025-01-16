import type { IBeatmap } from '../../beatmap/IBeatmap';
import { Drawable } from '@osucad/framework';
import { Beatmap } from '../../beatmap/Beatmap';
import { BeatmapTransformer } from '../../beatmap/BeatmapTransformer';
import { EditorBeatmap } from '../../editor/EditorBeatmap';
import { DrawableTimestamp } from '../../editor/screens/modding/DrawableTimestamp';
import { HitObject } from '../../hitObjects/HitObject';
import { VerifierBeatmap } from '../VerifierBeatmap';

export type Formatter = (value: any) => string | Drawable;

export function createFormatter(formatter: (value: any) => any): Formatter {
  return (value) => {
    if (value && value instanceof Drawable)
      return value;

    const formatted = formatter(value);
    if (typeof formatted === 'string' || (formatted && formatted instanceof Drawable))
      return formatted;

    return `${formatted}`;
  };
}

export function fixedPrecision(precision: number): Formatter {
  return createFormatter((value) => {
    if (typeof value === 'number')
      return value.toFixed(precision);
    return value;
  });
}

export function maxPrecision(precision: number): Formatter {
  const factor = 10 ** precision;
  return createFormatter((value) => {
    if (typeof value === 'number')
      value = Math.round(value * factor) / factor;
    return value;
  });
}

export function timestamp(): Formatter {
  return createFormatter((value) => {
    if (!value)
      return new DrawableTimestamp(0);

    if (typeof value === 'number')
      return new DrawableTimestamp(value);

    if (value && value instanceof HitObject)
      return new DrawableTimestamp(value.startTime, [value]);

    if (Array.isArray(value) && value[0] instanceof HitObject)
      return new DrawableTimestamp(value[0].startTime, value);

    return value;
  });
}

const beatmapClasses = [
  Beatmap,
  VerifierBeatmap,
  BeatmapTransformer,
  EditorBeatmap,
];

export const beatmap = createFormatter((value) => {
  if (beatmapClasses.some(it => value instanceof it)) {
    const beatmap = value as IBeatmap;

    // TODO: return drawable

    return beatmap.beatmapInfo.difficultyName;
  }

  return value;
});
export const defaultFormatter = createFormatter((value) => {
  if (value instanceof Drawable)
    return value;

  if (value instanceof HitObject)
    return new DrawableTimestamp(value.startTime, [value]);
  if (Array.isArray(value) && value[0] instanceof HitObject)
    return new DrawableTimestamp(value[0].startTime, value);
  if (beatmapClasses.some(it => value instanceof it)) {
    return beatmap(value);
  }

  return value;
});
