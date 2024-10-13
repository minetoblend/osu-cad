import type { OsuHitObject } from '../../beatmap/hitObjects/OsuHitObject';
import { clamp, Vec2 } from 'osucad-framework';
import { HitResult } from '../../beatmap/hitObjects/HitResult';
import { Slider } from '../../beatmap/hitObjects/Slider';
import { SliderEventGenerator } from '../../beatmap/hitObjects/SliderEventGenerator';
import { SliderRepeat } from '../../beatmap/hitObjects/SliderRepeat';
import { SliderTick } from '../../beatmap/hitObjects/SliderTick';
import { Spinner } from '../../beatmap/hitObjects/Spinner';
import { DifficultyHitObject } from './DifficultyHitObject';

export class OsuDifficultyHitObject extends DifficultyHitObject<OsuHitObject> {
  static readonly NORMALISED_RADIUS = 50;
  static readonly MIN_DELTA_TIME = 25;

  static readonly maximum_slider_radius = Math.fround(this.NORMALISED_RADIUS * 2.4);
  static readonly assumed_slider_radius = Math.fround(this.NORMALISED_RADIUS * 1.8);

  readonly #lastLastObject: OsuHitObject | null;

  angle: number | null = null;

  lazyJumpDistance = 0;

  minimumJumpDistance = 0;

  minimumJumpTime = 0;

  travelTime = 0;

  travelDistance = 0;

  constructor(baseObject: OsuHitObject, lastObject: OsuHitObject, lastLastObject: OsuHitObject | null, clockRate: number, hitObjects: OsuDifficultyHitObject[], index: number) {
    super(baseObject, lastObject, clockRate, hitObjects, index);

    this.#lastLastObject = lastLastObject;

    this.strainTime = Math.max(this.deltaTime, OsuDifficultyHitObject.MIN_DELTA_TIME);

    // lazer has special handling here for sliders because it uses `EmptyHitWindows`, which is not required here
    this.hitWindowGreat = 2 * this.baseObject.hitWindows.windowFor(HitResult.Great);

    this.#setDistance(clockRate);
  }

  opacityAt(time: number, hidden: boolean) {
    if (time > this.baseObject.startTime) {
      // Consider a hitobject as being invisible when its start time is passed.
      // In reality the hitobject will be visible beyond its start time up until its hittable window has passed,
      // but this is an approximation and such a case is unlikely to be hit where this function is used.
      return 0.0;
    }

    const fadeInStartTime = this.baseObject.startTime - this.baseObject.timePreempt;
    const fadeInDuration = this.baseObject.timeFadeIn;

    if (hidden) {
      // Taken from OsuModHidden.
      const fadeOutStartTime = this.baseObject.startTime - this.baseObject.timePreempt + this.baseObject.timeFadeIn;
      const fadeOutDuration = this.baseObject.timePreempt * 0.3;

      return Math.min(
        clamp((time - fadeInStartTime) / fadeInDuration, 0.0, 1.0),
        1.0 - clamp((time - fadeOutStartTime) / fadeOutDuration, 0.0, 1.0),
      );
    }

    return clamp((time - fadeInStartTime) / fadeInDuration, 0.0, 1.0);
  }

  getDoubletapness(osuNextObject: OsuDifficultyHitObject | null) {
    if (osuNextObject !== null) {
      const currDeltaTime = Math.max(1, this.deltaTime);
      const nextDeltaTime = Math.max(1, osuNextObject.deltaTime);
      const deltaDifference = Math.abs(nextDeltaTime - currDeltaTime);
      const speedRatio = currDeltaTime / Math.max(currDeltaTime, deltaDifference);
      const windowRatio = Math.min(1, currDeltaTime / this.hitWindowGreat) ** 2;
      return 1.0 - speedRatio ** (1 - windowRatio);
    }

    return 0;
  }

  #setDistance(clockRate: number) {
    if (this.baseObject instanceof Slider) {
      const currentSlider = this.baseObject;
      this.#computeSliderCursorPosition(currentSlider);
      // Bonus for repeat sliders until a better per nested object strain system can be achieved.
      this.travelDistance = currentSlider.lazyTravelDistance * Math.fround((1 + currentSlider.repeatCount / 2.5) ** (1.0 / 2.5));
      this.travelTime = Math.max(currentSlider.lazyTravelTime! / clockRate, OsuDifficultyHitObject.MIN_DELTA_TIME);
    }

    // We don't need to calculate either angle or distance when one of the last->curr objects is a spinner
    if (this.baseObject instanceof Spinner || this.lastObject instanceof Spinner)
      return;

    // We will scale distances by this factor, so we can assume a uniform CircleSize among beatmaps.
    let scalingFactor = Math.fround(OsuDifficultyHitObject.NORMALISED_RADIUS / Math.fround(this.baseObject.radius));

    if (this.baseObject.radius < 30) {
      const smallCircleBonus = Math.min(30 - Math.fround(this.baseObject.radius), 5) / 50;
      scalingFactor *= 1 + smallCircleBonus;
    }

    const lastCursorPosition = this.#getEndCursorPosition(this.lastObject);

    this.lazyJumpDistance = (this.baseObject.stackedPosition.sub(lastCursorPosition).scaleInPlace(scalingFactor)).length();
    this.minimumJumpTime = this.strainTime;
    this.minimumJumpDistance = this.lazyJumpDistance;

    if (this.lastObject instanceof Slider) {
      const lastSlider = this.lastObject as Slider;
      const lastTravelTime = Math.max(lastSlider.lazyTravelTime! / clockRate, OsuDifficultyHitObject.MIN_DELTA_TIME);
      this.minimumJumpTime = Math.max(this.strainTime - lastTravelTime, OsuDifficultyHitObject.MIN_DELTA_TIME);

      //
      // There are two types of slider-to-object patterns to consider in order to better approximate the real movement a player will take to jump between the hitobjects.
      //
      // 1. The anti-flow pattern, where players cut the slider short in order to move to the next hitobject.
      //
      //      <======o==>  ← slider
      //             |     ← most natural jump path
      //             o     ← a follow-up hitcircle
      //
      // In this case the most natural jump path is approximated by LazyJumpDistance.
      //
      // 2. The flow pattern, where players follow through the slider to its visual extent into the next hitobject.
      //
      //      <======o==>---o
      //                  ↑
      //        most natural jump path
      //
      // In this case the most natural jump path is better approximated by a new distance called "tailJumpDistance" - the distance between the slider's tail and the next hitobject.
      //
      // Thus, the player is assumed to jump the minimum of these two distances in all cases.
      //

      const tailJumpDistance = Vec2.sub(lastSlider.tailCircle!.stackedPosition, this.baseObject.stackedPosition).length() * scalingFactor;
      this.minimumJumpDistance = Math.max(0, Math.min(this.lazyJumpDistance - (OsuDifficultyHitObject.maximum_slider_radius - OsuDifficultyHitObject.assumed_slider_radius), tailJumpDistance - OsuDifficultyHitObject.maximum_slider_radius));
    }

    if (this.#lastLastObject != null && !(this.#lastLastObject instanceof Spinner)) {
      const lastLastCursorPosition = this.#getEndCursorPosition(this.#lastLastObject);

      const v1 = lastLastCursorPosition.sub(this.lastObject.stackedPosition);
      const v2 = this.baseObject.stackedPosition.sub(lastCursorPosition);

      const dot = v1.dot(v2);
      const det = v1.x * v2.y - v1.y * v2.x;

      this.angle = Math.abs(Math.atan2(det, dot));
    }
  }

  #computeSliderCursorPosition(slider: Slider) {
    if (slider.lazyEndPosition != null)
      return;

    let trackingEndTime = Math.max(
      slider.startTime + slider.duration + SliderEventGenerator.TAIL_LENIENCY,
      slider.startTime + slider.duration / 2,
    );

    let nestedObjects = slider.nestedHitObjects;

    let lastRealTick: SliderTick | null = null;

    for (const nested of slider.nestedHitObjects) {
      if (nested instanceof SliderTick)
        lastRealTick = nested;
    }

    if (lastRealTick && lastRealTick.startTime > trackingEndTime) {
      trackingEndTime = lastRealTick.startTime;

      // When the last tick falls after the tracking end time, we need to re-sort the nested objects
      // based on time. This creates a somewhat weird ordering which is counter to how a user would
      // understand the slider, but allows a zero-diff with known diffcalc output.
      //
      // To reiterate, this is definitely not correct from a difficulty calculation perspective
      // and should be revisited at a later date (likely by replacing this whole code with the commented
      // version above).
      const reordered = [...nestedObjects];

      reordered.splice(reordered.indexOf(lastRealTick), 1);
      reordered.push(lastRealTick);

      nestedObjects = reordered;
    }

    slider.lazyTravelTime = trackingEndTime - slider.startTime;

    let endTimeMin = slider.lazyTravelTime / slider.spanDuration;
    if (endTimeMin % 2 >= 1)
      endTimeMin = 1 - endTimeMin % 1;
    else
      endTimeMin %= 1;

    slider.lazyEndPosition = slider.stackedPosition.add(slider.getPathPositionAtTime(endTimeMin, new Vec2())); // temporary lazy end position until a real result can be derived.

    let currCursorPosition = slider.stackedPosition;

    slider.lazyTravelPath = [{
      position: currCursorPosition.clone(),
      time: slider.startTime,
    }];

    const scalingFactor = OsuDifficultyHitObject.NORMALISED_RADIUS / slider.radius; // lazySliderDistance is coded to be sensitive to scaling, this makes the maths easier with the thresholds being used.

    for (let i = 1; i < nestedObjects.length; i++) {
      const currMovementObj = nestedObjects[i] as OsuHitObject;

      let currMovement = Vec2.sub(currMovementObj.stackedPosition, currCursorPosition);
      let currMovementLength = scalingFactor * currMovement.length();
      const currMovementTime = currMovementObj.startTime;

      // Amount of movement required so that the cursor position needs to be updated.
      let requiredMovement = OsuDifficultyHitObject.assumed_slider_radius;

      if (i === nestedObjects.length - 1) {
        // The end of a slider has special aim rules due to the relaxed time constraint on position.
        // There is both a lazy end position as well as the actual end slider position. We assume the player takes the simpler movement.
        // For sliders that are circular, the lazy end position may actually be farther away than the sliders true end.
        // This code is designed to prevent buffing situations where lazy end is actually a less efficient movement.
        const lazyMovement = Vec2.sub(slider.lazyEndPosition, currCursorPosition);

        if (lazyMovement.length < currMovement.length)
          currMovement = lazyMovement;

        currMovementLength = scalingFactor * currMovement.length();
      }
      else if (currMovementObj instanceof SliderRepeat) {
        // For a slider repeat, assume a tighter movement threshold to better assess repeat sliders.
        requiredMovement = OsuDifficultyHitObject.NORMALISED_RADIUS;
      }

      if (currMovementLength > requiredMovement) {
        // this finds the positional delta from the required radius and the current position, and updates the currCursorPosition accordingly, as well as rewarding distance.
        currCursorPosition = Vec2.add(currCursorPosition, Vec2.scale(currMovement, ((currMovementLength - requiredMovement) / currMovementLength)));
        currMovementLength *= (currMovementLength - requiredMovement) / currMovementLength;
        slider.lazyTravelDistance += currMovementLength;
      }

      if (i === nestedObjects.length - 1)
        slider.lazyEndPosition = currCursorPosition;

      slider.lazyTravelPath.push({
        position: currCursorPosition.clone(),
        time: currMovementTime,
      });
    }
  }

  get lazyTravelPath() {
    return this.baseObject.lazyTravelPath;
  }

  #getEndCursorPosition(hitObject: OsuHitObject) {
    let pos = hitObject.stackedEndPosition;

    if (hitObject instanceof Slider) {
      this.#computeSliderCursorPosition(hitObject);
      pos = hitObject.lazyEndPosition ?? pos;
    }

    return pos;
  };

  readonly hitWindowGreat: number;

  override previous(backwardsIndex: number): OsuDifficultyHitObject | null {
    return super.previous(backwardsIndex) as OsuDifficultyHitObject | null;
  }

  override next(forwardsIndex: number) {
    return super.next(forwardsIndex) as OsuDifficultyHitObject | null;
  }

  readonly strainTime: number;
}
