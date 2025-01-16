import { clamp } from '@osucad/framework';

export class SliderEventGenerator {
  static readonly TAIL_LENIENCY = -36;

  static* generate(
    startTime: number,
    spanDuration: number,
    velocity: number,
    tickDistance: number,
    totalDistance: number,
    spanCount: number,
  ): Generator<SliderEvent, undefined, undefined> {
    const maxLength = 100000;

    const length = Math.min(maxLength, totalDistance);
    tickDistance = clamp(tickDistance, 0, length);

    const minDistanceFromEnd = velocity * 10;

    yield {
      type: 'head',
      spanIndex: 0,
      spanStartTime: startTime,
      time: startTime,
      pathProgress: 0,
    };

    if (tickDistance !== 0) {
      for (let span = 0; span < spanCount; span++) {
        const spanStartTime = startTime + span * spanDuration;
        const reversed = span % 2 === 1;

        const ticks = [...this.generateTicks(span, spanStartTime, spanDuration, reversed, length, tickDistance, minDistanceFromEnd)];

        if (reversed)
          ticks.reverse();

        yield * ticks;

        if (span < spanCount - 1) {
          yield {
            type: 'repeat',
            spanIndex: span,
            spanStartTime: startTime + span * spanDuration,
            time: spanStartTime + spanDuration,
            pathProgress: (span + 1) % 2,
          };
        }
      }
    }

    const totalDuration = spanCount * spanDuration;

    yield {
      type: 'tail',
      spanIndex: spanCount - 1,
      spanStartTime: startTime + (spanCount - 1) * spanDuration,
      time: startTime + totalDuration,
      pathProgress: spanCount % 2,
    };
  }

  private static* generateTicks(spanIndex: number, spanStartTime: number, spanDuration: number, reversed: boolean, length: number, tickDistance: number, minDistanceFromEnd: number): Generator<SliderEvent, void, void> {
    for (let d = tickDistance; d <= length; d += tickDistance) {
      if (d >= length - minDistanceFromEnd)
        break;

      // Always generate ticks from the start of the path rather than the span to ensure that ticks in repeat spans are positioned identically to those in non-repeat spans
      const pathProgress = d / length;
      const timeProgress = reversed ? 1 - pathProgress : pathProgress;

      yield {
        type: 'tick',
        spanIndex,
        spanStartTime,
        time: spanStartTime + timeProgress * spanDuration,
        pathProgress,
      };
    }
  }
}

interface SliderEvent {
  type: 'head' | 'repeat' | 'tick' | 'tail';
  spanIndex: number;
  spanStartTime: number;
  time: number;
  pathProgress: number;
}
