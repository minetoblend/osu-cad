import isInCi from "is-in-ci";
import { expect } from "vitest";
import { clamp } from "../utils/clamp";
import { DecouplingFramedClock } from "./DecouplingFramedClock";
import { StopwatchClock } from "./StopwatchClock";
import { TestClock } from "./TestClock";
import { TestStopwatchClockWithRangeLimit } from "./TestStopwatchClockWithRangeLimit";


class TestClockWithRange extends TestClock
{
  public minTime = 0;

  public maxTime = Number.POSITIVE_INFINITY;

  public override seek(position: number): boolean
  {
    if (clamp(position, this.minTime, this.maxTime) !== position)
      return false;

    return super.seek(position);
  }
}

function createClocks()
{
  const source = new TestClockWithRange();
  const decouplingClock = new DecouplingFramedClock();
  decouplingClock.changeSource(source);

  return { source, decouplingClock };
}

describe.concurrent("DecouplingFramedClock", () =>
{
  //#region Basic assumptions (which hold for both decoupled and not)
  test.each([true, false])("StartFromDecoupling (%j)", (allowDecoupling) =>
  {
    const { source, decouplingClock } = createClocks();

    decouplingClock.allowDecoupling = allowDecoupling;

    expect(source.isRunning).toBe(false);
    expect(decouplingClock.isRunning).toBe(false);

    decouplingClock.start();
    decouplingClock.processFrame();

    expect(source.isRunning).toBe(true);
    expect(decouplingClock.isRunning).toBe(true);
  });

  test.each([true, false])("StartFromSource (%j)", (allowDecoupling) =>
  {
    const { source, decouplingClock } = createClocks();

    decouplingClock.allowDecoupling = allowDecoupling;

    expect(source.isRunning).toBe(false);
    expect(decouplingClock.isRunning).toBe(false);

    source.start();
    decouplingClock.processFrame();

    expect(source.isRunning).toBe(true);
    expect(decouplingClock.isRunning).toBe(true);
  });

  test("SeekFromDecouplingWithoutProcessFrame", async () =>
  {
    const { source, decouplingClock } = createClocks();

    decouplingClock.allowDecoupling = true;

    expect(source.currentTime).toBe(0);
    expect(decouplingClock.currentTime).toBe(0);

    decouplingClock.start();
    decouplingClock.seek(1000);
    expect(source.isRunning).toBe(true);

    decouplingClock.seek(-1000);
    expect(source.isRunning).toBe(false);

    decouplingClock.seek(-1);

    await new Promise(resolve => setTimeout(resolve, 500));

    decouplingClock.processFrame();

    while (decouplingClock.currentTime < 0)
      decouplingClock.processFrame();

    expect(source.isRunning).toBe(true);
  });

  test.each([true, false])("SeekFromDecoupling (%j)", allowDecoupling =>
  {
    const { source, decouplingClock } = createClocks();

    decouplingClock.allowDecoupling = allowDecoupling;

    expect(source.currentTime).toBe(0);
    expect(decouplingClock.currentTime).toBe(0);

    decouplingClock.seek(1000);

    expect(source.currentTime).toBe(1000);
    expect(decouplingClock.currentTime).toBe(0);

    decouplingClock.processFrame();

    expect(source.currentTime).toBe(1000);
    expect(decouplingClock.currentTime).toBe(1000);
  });

  test.each([true, false])("SeekFromSource (%j)", allowDecoupling =>
  {
    const { source, decouplingClock } = createClocks();

    decouplingClock.allowDecoupling = allowDecoupling;

    source.start();

    expect(source.currentTime).toBe(0);
    expect(decouplingClock.currentTime).toBe(0);

    source.seek(1000);
    decouplingClock.processFrame();

    expect(source.currentTime).toBe(1000);
    expect(decouplingClock.currentTime).toBe(1000);
  });

  test.each([true, false])("ChangeSourceUpdatesToNewSourceTime (%j)", allowDecoupling =>
  {
    const { source, decouplingClock } = createClocks();

    decouplingClock.allowDecoupling = allowDecoupling;

    const first_source_time = 256000;
    const second_source_time = 128000;

    source.seek(first_source_time);
    source.start();

    decouplingClock.processFrame();

    const secondSource = new TestClock();
    secondSource.currentTime = second_source_time;

    expect(decouplingClock.currentTime).toBe(first_source_time);

    decouplingClock.changeSource(secondSource);
    decouplingClock.processFrame();

    expect(secondSource.currentTime).toBe(second_source_time);
    expect(decouplingClock.currentTime).toBe(second_source_time);
  });

  test.each([true, false])("ChangeSourceUpdatesToCorrectSourceState (%j)", allowDecoupling =>
  {
    const { source, decouplingClock } = createClocks();

    decouplingClock.allowDecoupling = allowDecoupling;

    source.start();
    decouplingClock.processFrame();
    expect(decouplingClock.isRunning).toBe(true);

    const secondSource = new TestClock();

    decouplingClock.changeSource(secondSource);
    decouplingClock.processFrame();
    expect(decouplingClock.isRunning).toBe(false);

    decouplingClock.changeSource(source);
    decouplingClock.processFrame();
    expect(decouplingClock.isRunning).toBe(true);
  });

  test.each([true, false])("Reset (%j)", allowDecoupling =>
  {
    const { source, decouplingClock } = createClocks();

    decouplingClock.allowDecoupling = allowDecoupling;

    source.seek(2000);
    source.start();

    decouplingClock.processFrame();

    expect(decouplingClock.isRunning).toBe(true);
    expect(decouplingClock.currentTime).toBe(2000);

    decouplingClock.reset();
    decouplingClock.processFrame();

    expect(decouplingClock.isRunning).toBe(false);
    expect(source.isRunning).toBe(false);
    expect(decouplingClock.currentTime).toBe(0);
    expect(source.currentTime).toBe(0);
  });
  //#endregion

  //#region Operation in non-decoupling mode
  test("SourceStoppedWhileNotDecoupling", () =>
  {
    const { source, decouplingClock } = createClocks();

    decouplingClock.allowDecoupling = false;
    decouplingClock.start();
    decouplingClock.processFrame();

    expect(source.isRunning).toBe(true);
    expect(decouplingClock.isRunning).toBe(true);

    source.stop();
    decouplingClock.processFrame();

    expect(source.isRunning).toBe(false);
    expect(decouplingClock.isRunning).toBe(false);
  });

  test("SeekNegativeWhileNotDecoupling", () =>
  {
    const { source, decouplingClock } = createClocks();

    decouplingClock.allowDecoupling = false;

    expect(decouplingClock.seek(-1000)).toBe(false);

    expect(source.currentTime).toBe(0);
    expect(decouplingClock.currentTime).toBe(0);
  });

  test("SeekPositiveWhileNotDecoupling", () =>
  {
    const { source, decouplingClock } = createClocks();

    decouplingClock.allowDecoupling = false;
    expect(decouplingClock.seek(1000)).toBe(true);
    decouplingClock.processFrame();

    expect(source.currentTime).toBe(1000);
    expect(decouplingClock.currentTime).toBe(1000);
  });
  //#endregion

  //#region Operation in decoupling mode
  test("SourceStoppedWhileDecoupling", () =>
  {
    const { source, decouplingClock } = createClocks();

    decouplingClock.allowDecoupling = true;
    decouplingClock.start();
    decouplingClock.processFrame();

    expect(source.isRunning).toBe(true);
    expect(decouplingClock.isRunning).toBe(true);

    source.stop();
    decouplingClock.processFrame();

    expect(source.isRunning).toBe(false);
    expect(decouplingClock.isRunning).toBe(true);
  });

  test("SeekNegativeWhileDecoupling", () =>
  {
    const { source, decouplingClock } = createClocks();

    decouplingClock.allowDecoupling = true;
    expect(decouplingClock.seek(-1000)).toBe(true);

    decouplingClock.processFrame();

    expect(source.currentTime).toBe(0);

    // We're decoupling, so should be able to go beyond zero.
    expect(decouplingClock.currentTime).toBe(-1000);
  });

  test("SeekPositiveWhileDecoupling", () =>
  {
    const { source, decouplingClock } = createClocks();

    decouplingClock.allowDecoupling = true;
    expect(decouplingClock.seek(1000)).toBe(true);
    decouplingClock.processFrame();

    expect(source.currentTime).toBe(1000);
    expect(decouplingClock.currentTime).toBe(1000);
  });

  test("SeekBeyondLengthWhileDecoupling", () =>
  {
    const { decouplingClock } = createClocks();

    const source = new TestStopwatchClockWithRangeLimit();
    source.maxTime = 500;

    decouplingClock.changeSource(source);
    decouplingClock.allowDecoupling = true;

    expect(decouplingClock.seek(1000)).toBe(true);
    decouplingClock.processFrame();

    expect(source.currentTime).toBe(500);
    expect(decouplingClock.currentTime).toBe(1000);
  });

  test("SeekFromNegativeToBeyondLengthWhileDecoupling", () =>
  {
    const { decouplingClock } = createClocks();

    const source = new TestStopwatchClockWithRangeLimit();
    source.maxTime = 500;

    decouplingClock.changeSource(source);
    decouplingClock.allowDecoupling = true;

    decouplingClock.start();

    expect(decouplingClock.seek(-1000)).toBe(true);
    decouplingClock.processFrame();

    expect(source.currentTime).toBeGreaterThan(-30);
    expect(source.currentTime).toBeLessThan(30);
    expect(source.isRunning).toBe(false);
    expect(decouplingClock.currentTime).toBe(-1000);
    expect(decouplingClock.isRunning).toBe(true);

    expect(decouplingClock.seek(1000)).toBe(true);
    decouplingClock.processFrame();

    expect(source.currentTime).toBe(500);
    expect(source.isRunning).toBe(false);
    expect(decouplingClock.currentTime).toBeGreaterThan(1000 - 30);
    expect(decouplingClock.currentTime).toBeLessThan(1000 + 30);
    expect(decouplingClock.isRunning).toBe(true);
  });

  test("SeekFromSourceWhileDecoupling", () =>
  {
    const { source, decouplingClock } = createClocks();

    decouplingClock.allowDecoupling = true;

    expect(source.currentTime).toBe(0);
    expect(decouplingClock.currentTime).toBe(0);

    source.seek(1000);

    expect(source.currentTime).toBe(1000);
    // One might expect this to match the source, but with the current implementation, it doesn't.
    expect(decouplingClock.currentTime).not.toBe(1000);

    // One should seek the decoupling clock directly.
    decouplingClock.seek(1000);
    decouplingClock.processFrame();

    expect(source.currentTime).toBe(1000);
    expect(decouplingClock.currentTime).toBe(1000);
  });

  test.each([true, false])("StartFromNegativeTimeIncrementsCorrectly (%d)", async (seekBeforeStart) =>
  {
    const { source, decouplingClock } = createClocks();

    await new Promise(resolve => setTimeout(resolve, 500));

    decouplingClock.allowDecoupling = true;

    if (seekBeforeStart)
    {
      decouplingClock.seek(-300);
      decouplingClock.start();
    }
    else
    {
      decouplingClock.start();
      decouplingClock.seek(-300);
    }

    decouplingClock.processFrame();

    expect(source.isRunning).toBe(false);
    expect(source.currentTime).toBe(0);

    const time = decouplingClock.currentTime;

    expect(decouplingClock.isRunning).toBe(true);
    expect(decouplingClock.currentTime).toBeLessThan(0);

    await new Promise(resolve => setTimeout(resolve, 100));

    decouplingClock.processFrame();
    expect(decouplingClock.currentTime).toBeLessThan(0);
    expect(decouplingClock.currentTime).toBeGreaterThan(time);
  });

  test.skipIf(isInCi)("BackwardPlaybackOverZeroBoundary", async () =>
  {
    const { decouplingClock } = createClocks();

    const source = new TestStopwatchClockWithRangeLimit();
    decouplingClock.changeSource(source);
    decouplingClock.allowDecoupling = true;

    decouplingClock.seek(300);
    decouplingClock.rate = -1;
    decouplingClock.start();

    decouplingClock.processFrame();

    while (source.isRunning)
    {
      decouplingClock.processFrame();
      expect(decouplingClock.currentTime).toBeGreaterThan(source.currentTime - 15);
      expect(decouplingClock.currentTime).lessThan(source.currentTime + 15);
    }

    expect(source.isRunning).toBe(false);

    let time = decouplingClock.currentTime;

    while (decouplingClock.currentTime > -300)
    {
      console.log(decouplingClock.currentTime);

      expect(source.isRunning).toBe(false);
      expect(decouplingClock.currentTime).toBeLessThanOrEqual(time);
      time = decouplingClock.currentTime;

      decouplingClock.processFrame();

      await new Promise(resolve => setTimeout(resolve, 10));
    }
  });

  test.skip.each([0, 1, 10, 50])("NoDecoupledDrift(%d)", async (updateRate) =>
  {
    const { decouplingClock } = createClocks();

    const stopwatch = new StopwatchClock();

    decouplingClock.start();
    stopwatch.start();

    decouplingClock.seek(-100);
    stopwatch.seek(-100);

    while (decouplingClock.currentTime <= 0)
    {
      decouplingClock.processFrame();
      expect(decouplingClock.currentTime).toBeLessThan(stopwatch.currentTime + 1);
      expect(decouplingClock.currentTime).toBeGreaterThan(stopwatch.currentTime - 1);

      await new Promise(resolve => setTimeout(resolve, updateRate));
    }
  });

  test.skipIf(isInCi)("ForwardPlaybackOverZeroBoundary", async () =>
  {
    const { decouplingClock } = createClocks();

    const source = new TestStopwatchClockWithRangeLimit();
    decouplingClock.changeSource(source);
    decouplingClock.allowDecoupling = true;

    decouplingClock.seek(-300);
    decouplingClock.start();

    decouplingClock.processFrame();

    let time = decouplingClock.currentTime;

    while (decouplingClock.currentTime < 0)
    {
      expect(source.isRunning).toBe(false);
      expect(decouplingClock.currentTime).toBeGreaterThanOrEqual(time);
      time = decouplingClock.currentTime;

      decouplingClock.processFrame();
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    expect(source.currentTime).toBeGreaterThan(decouplingClock.currentTime - 15);
    expect(source.currentTime).toBeLessThan(decouplingClock.currentTime + 15);

    // Subsequently test stop/start works correctly.
    decouplingClock.stop();
    decouplingClock.processFrame();
    expect(decouplingClock.isRunning).toBe(false);
    expect(source.isRunning).toBe(false);

    decouplingClock.start();
    decouplingClock.processFrame();
    expect(decouplingClock.isRunning).toBe(true);
    expect(source.isRunning).toBe(true);
  });

  test.skipIf(isInCi)("ForwardPlaybackOverLengthBoundary", async () =>
  {
    const { decouplingClock } = createClocks();

    const source = new TestStopwatchClockWithRangeLimit();
    source.maxTime = 10000;

    decouplingClock.changeSource(source);
    decouplingClock.allowDecoupling = true;

    decouplingClock.seek(9800);
    decouplingClock.start();

    decouplingClock.processFrame();

    let time = decouplingClock.currentTime;
    const tolerance = 30;

    // The decoupling clock generally lags behind the source clock,
    // so we don't want the threshold here to go up to the full tolerance,
    // to avoid situations like so:
    //
    // x: decouplingClock
    // o: sourceClock
    //
    // ------x-----------o------>
    //    9980ms      10000ms
    //
    // The source clock has reached its playback limit and cannot seek further, so it will stop.
    // The decoupling clock hasn't caught up to the source clock yet, but it is close enough to pass the tolerance check.
    //
    // Subtracting the tolerance ensures that both the decoupling and source clocks stay in the same 30ms band, but neither stops yet.
    // We will assert that the source should eventually stop further down anyway.
    while (decouplingClock.currentTime < 10000 - tolerance)
    {
      expect(source.isRunning).toBe(true);
      expect(source.currentTime).toBeGreaterThan(decouplingClock.currentTime - 15);
      expect(source.currentTime).toBeLessThan(decouplingClock.currentTime + 15);
      expect(decouplingClock.currentTime).toBeGreaterThanOrEqual(time);
      time = decouplingClock.currentTime;

      decouplingClock.processFrame();
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    while (source.isRunning)
    {
      decouplingClock.processFrame();
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    expect(source.isRunning).toBe(false);
    expect(decouplingClock.currentTime).toBeLessThan(10100);

    while (decouplingClock.currentTime < 10200)
    {
      expect(decouplingClock.isRunning).toBe(true);
      expect(decouplingClock.currentTime).toBeGreaterThanOrEqual(time);
      time = decouplingClock.currentTime;

      decouplingClock.processFrame();
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    expect(source.isRunning).toBe(false);
  });

  test("PlayDifferentSourceAfterSeekFailure", () =>
  {
    const { source, decouplingClock } = createClocks();

    decouplingClock.allowDecoupling = true;

    const firstSource = source as TestClockWithRange;
    firstSource.maxTime = 100;

    decouplingClock.seek(1000);

    expect(firstSource.isRunning).toBe(false);

    const secondSource = new TestClockWithRange();

    decouplingClock.changeSource(secondSource);
    decouplingClock.start();

    expect(secondSource.isRunning).toBe(true);
  });
  //#endregion
});
