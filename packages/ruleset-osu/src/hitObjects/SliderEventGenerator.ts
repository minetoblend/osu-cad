import { clamp } from "@osucad/framework";

const max_length = 100_000;

const TAIL_LENIENCY = -36;

function* generate(
  startTime: number,
  spanDuration: number,
  velocity: number,
  tickDistance: number,
  totalDistance: number,
  spanCount: number,
): Generator<SliderEventDescriptor, void, unknown>
{
  const length = Math.min(totalDistance, max_length);
  tickDistance = clamp(tickDistance, 0, length);

  const minDistanceFromEnd = velocity * 10;

  yield {
    type: SliderEventType.Head,
    spanIndex: 0,
    spanStartTime: startTime,
    time: startTime,
    pathProgress: 0,
  };

  for (let span = 0; span < spanCount; span++)
  {
    const spanStartTime = startTime + span * spanDuration;
    const reversed = span % 2 === 1;

    if (tickDistance !== 0)
    {
      const ticks = [...generateTicks(span, spanStartTime, spanDuration, reversed, length, tickDistance, minDistanceFromEnd)];

      if (reversed)
        ticks.reverse();

      yield* ticks;
    }

    if (span < spanCount - 1)
    {
      yield{
        type: SliderEventType.Repeat,
        spanIndex: span,
        spanStartTime: startTime + span * spanDuration,
        time: spanStartTime + spanDuration,
        pathProgress: (span + 1) % 2,
      };
    }
  }

  const totalDuration = spanCount * spanDuration;

  const finalSpanIndex = spanCount - 1;
  const finalSpanStartTime = startTime + finalSpanIndex * spanDuration;

  const legacyLastTickTime = Math.max(startTime + totalDuration / 2, (finalSpanStartTime + spanDuration) + TAIL_LENIENCY);
  let legacyLastTickProgress = (legacyLastTickTime - finalSpanStartTime) / spanDuration;

  if (spanCount % 2 === 0)
    legacyLastTickProgress = 1 - legacyLastTickProgress;

  yield {
    type: SliderEventType.LegacyLastTick,
    spanIndex: finalSpanIndex,
    spanStartTime: finalSpanStartTime,
    time: legacyLastTickTime,
    pathProgress: legacyLastTickProgress,
  };

  yield {
    type: SliderEventType.Tail,
    spanIndex: finalSpanIndex,
    spanStartTime: startTime + (spanCount - 1) * spanDuration,
    time: startTime + totalDuration,
    pathProgress: spanCount % 2,
  };
}


function* generateTicks(
  spanIndex: number,
  spanStartTime: number,
  spanDuration: number,
  reversed: boolean,
  length: number,
  tickDistance: number,
  minDistanceFromEnd: number,
): Generator<SliderEventDescriptor, void, unknown>
{
  for (let d = tickDistance; d <= length; d += tickDistance)
  {
    if (d >= length - minDistanceFromEnd)
      break;

    const pathProgress = d / length;
    const timeProgress = reversed ? 1 - pathProgress : pathProgress;

    yield {
      type: SliderEventType.Tick,
      spanIndex: spanIndex,
      spanStartTime: spanStartTime,
      time: spanStartTime + timeProgress * spanDuration,
      pathProgress: pathProgress,
    };
  }
}

export class SliderEventGenerator
{
  static readonly TAIL_LENIENCY = TAIL_LENIENCY;

  static readonly generate = generate;
}

export interface SliderEventDescriptor
{
  readonly type: SliderEventType;
  readonly spanIndex: number;
  readonly spanStartTime: number;
  readonly time: number;
  readonly pathProgress: number;
}

export enum SliderEventType
{
  Tick,
  LegacyLastTick,
  Head,
  Tail,
  Repeat,
}
