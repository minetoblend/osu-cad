import isInCi from "is-in-ci";
import { almostEquals } from "../utils/almostEquals";
import { InterpolatingFramedClock } from "./InterpolatingFramedClock";
import { StopwatchClock } from "./StopwatchClock";
import { TestClock } from "./TestClock";
import { TestNonAdjustableClock } from "./TestNonAdjustableClock";

function createClocks()
{
  const source = new TestClock();
  const interpolating = new InterpolatingFramedClock();
  interpolating.changeSource(source);

  return {
    source,
    interpolating,
  };
}

describe.concurrent("InterpolatingFramedClock", () =>
{
  test("NeverInterpolatesBackwards", async () =>
  {
    const { source, interpolating } = createClocks();

    assert.equal(source.currentTime, interpolating.currentTime, "Interpolating should match source time.");
    source.start();
    assert.equal(source.currentTime, interpolating.currentTime, "Interpolating should match source time.");

    interpolating.processFrame();

    let lastValue = interpolating.currentTime;

    for (let i = 0; i < 30; i++)
    {
      interpolating.processFrame();
      assert.isAtLeast(interpolating.currentTime, lastValue, "Interpolating should not jump against rate.");
      assert.isAtLeast(interpolating.currentTime, source.currentTime, "Interpolating should not jump before source time.");

      await new Promise(resolve => setTimeout(resolve, interpolating.allowableErrorMilliseconds / 2));
      lastValue = interpolating.currentTime;
    }

    let interpolatedCount = 0;

    // test with test clock elapsing
    lastValue = interpolating.currentTime;

    for (let i = 0; i < 100; i++)
    {
      // we want to interpolate but not fall behind and fail interpolation too much
      source.currentTime += interpolating.allowableErrorMilliseconds / 2 + 5;
      interpolating.processFrame();

      assert.isAtLeast(interpolating.currentTime, lastValue, "Interpolating should not jump against rate.");
      assert.isAtMost(Math.abs(interpolating.currentTime - source.currentTime), interpolating.allowableErrorMilliseconds, "Interpolating should be within allowance.");

      if (interpolating.isInterpolating)
        interpolatedCount++;

      await new Promise(resolve => setTimeout(resolve, interpolating.allowableErrorMilliseconds / 2));
      lastValue = interpolating.currentTime;
    }

    assert.isAbove(interpolatedCount, 10);
  });

  test("SourceChangeTransfersValueAdjustable", () =>
  {
    const first_source_time = 256000;
    const second_source_time = 128000;

    const { source, interpolating } = createClocks();

    source.seek(first_source_time);

    const secondSource = new TestClock();
    secondSource.currentTime = second_source_time;

    interpolating.processFrame();
    assert.equal(interpolating.currentTime, first_source_time);

    interpolating.changeSource(secondSource);
    interpolating.processFrame();

    assert.equal(secondSource.currentTime, second_source_time);
    assert.equal(interpolating.currentTime, second_source_time);
  });

  test("SourceChangeTransfersValueNonAdjustable", () =>
  {
    const { source, interpolating } = createClocks();

    const first_source_time = 256000;
    const second_source_time = 128000;

    source.seek(first_source_time);

    const secondSource = new TestNonAdjustableClock();
    secondSource.currentTime = second_source_time;


    interpolating.processFrame();
    assert.equal(interpolating.currentTime, first_source_time);

    interpolating.changeSource(secondSource);
    interpolating.processFrame();

    assert.equal(secondSource.currentTime, second_source_time);
    assert.equal(interpolating.currentTime, second_source_time);
  });

  test("NeverInterpolatesBackwardsOnInterpolationFail", async () =>
  {
    const { source, interpolating } = createClocks();

    const sleep_time = 20;

    let lastValue = interpolating.currentTime;
    source.start();
    let interpolatedCount = 0;

    for (let i = 0; i < 200; i++)
    {
      source.rate += i * 10;

      if (i < 100) // stop the elapsing at some point in time. should still work as source's ElapsedTime is zero.
        source.currentTime += sleep_time * source.rate;

      interpolating.processFrame();

      if (interpolating.isInterpolating)
        interpolatedCount++;

      assert.isAtLeast(interpolating.currentTime, lastValue, "Interpolating should not jump against rate.");
      assert.isAtMost(Math.abs(interpolating.currentTime - source.currentTime), interpolating.allowableErrorMilliseconds * source.rate, "Interpolating should be within allowance.");

      await new Promise(resolve => setTimeout(resolve, sleep_time));
      lastValue = interpolating.currentTime;
    }

    assert.isAbove(interpolatedCount, 10);
  });

  test("CanSeekForwardsOnInterpolationFail", async () =>
  {
    const { source, interpolating } = createClocks();

    const sleep_time = 20;

    let lastValue = interpolating.currentTime;
    source.start();
    let interpolatedCount = 0;

    for (let i = 0; i < 200; i++)
    {
      source.rate += i * 10;

      const skipSourceForwards = i == 100;

      if (skipSourceForwards) // seek forward once at a random point.
      {
        source.currentTime += interpolating.allowableErrorMilliseconds * 10 * source.rate;
        interpolating.processFrame();
        assert.isFalse(interpolating.isInterpolating);
        assert.equal(interpolating.currentTime, source.currentTime);
      }
      else
      {
        source.currentTime += sleep_time * source.rate;
        interpolating.processFrame();
      }

      if (interpolating.isInterpolating)
        interpolatedCount++;

      assert.isAtLeast(interpolating.currentTime, lastValue, "Interpolating should not jump against rate.");
      assert.isAtMost(Math.abs(interpolating.currentTime - source.currentTime), interpolating.allowableErrorMilliseconds * source.rate, "Interpolating should be within allowance.");

      await new Promise(resolve => setTimeout(resolve, sleep_time));
      lastValue = interpolating.currentTime;
    }

    assert.isAbove(interpolatedCount, 10);
  });

  test("CanSeekBackwards", () =>
  {
    const { source, interpolating } = createClocks();

    assert.equal(source.currentTime, interpolating.currentTime, "Interpolating should match source time.");
    source.start();

    assert.equal(source.currentTime, interpolating.currentTime, "Interpolating should match source time.");
    interpolating.processFrame();

    source.seek(10000);
    interpolating.processFrame();
    assert.equal(source.currentTime, interpolating.currentTime, "Interpolating should match source time.");

    source.seek(0);
    interpolating.processFrame();
    assert.equal(source.currentTime, interpolating.currentTime, "Interpolating should match source time.");
  });

  test("InterpolationAfterSourceStoppedThenSeeked", async () =>
  {
    const { source, interpolating } = createClocks();

    interpolating.allowableErrorMilliseconds = 100000;

    source.start();

    while (!interpolating.isInterpolating)
    {
      source.currentTime += 10;
      await new Promise(resolve => setTimeout(resolve, 10));
      interpolating.processFrame();
    }

    source.stop();
    source.seek(-10000);

    interpolating.processFrame();
    assert.isFalse(interpolating.isInterpolating);
    assert.closeTo(interpolating.currentTime, -10000, 100);
    assert.closeTo(interpolating.elapsedFrameTime, -10000, 100);

    source.start();
    interpolating.processFrame();
    assert.closeTo(interpolating.currentTime, -10000, 100);
    assert.closeTo(interpolating.elapsedFrameTime, 0, 100);
  });

  test.skipIf(isInCi).concurrent.each([0,1,10,50])("TestNoInterpolationDrift (%d)", async (updateRate: number) =>
  {
    const { source, interpolating } = createClocks();

    const stopwatch = new StopwatchClock();

    interpolating.changeSource(stopwatch);

    source.start();
    stopwatch.start();

    while (interpolating.currentTime <= 1000)
    {
      interpolating.processFrame();
      assert.closeTo(interpolating.currentTime, stopwatch.currentTime, 1);

      await new Promise(resolve => setTimeout(resolve, updateRate));
    }
  });

  test("InterpolationStaysWithinBounds", async () =>
  {
    const { source, interpolating } = createClocks();

    source.start();

    const sleep_time = 20;

    for (let i = 0; i < 100; i++)
    {
      source.currentTime += sleep_time;
      interpolating.processFrame();

      // should be a nooop
      interpolating.changeSource(source);

      assert.isTrue(almostEquals(interpolating.currentTime, source.currentTime, interpolating.allowableErrorMilliseconds),
          "Interpolating should be within allowable error bounds.");

      await new Promise(resolve => setTimeout(resolve, sleep_time));
    }

    source.stop();
    interpolating.processFrame();

    assert.isFalse(interpolating.isRunning);
    assert.closeTo(source.currentTime, interpolating.currentTime, interpolating.allowableErrorMilliseconds);
  });
});
