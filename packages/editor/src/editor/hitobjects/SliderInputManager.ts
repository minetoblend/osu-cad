import type { IFrameBasedClock, MouseMoveEvent, Vec2 } from 'osucad-framework';
import type { DrawableSlider } from './DrawableSlider.ts';
import type { DrawableSliderHead } from './DrawableSliderHead.ts';
import { clamp, Component, resolved } from 'osucad-framework';
import { SliderEventGenerator } from '../../beatmap/hitObjects/SliderEventGenerator.ts';
import { SliderRepeat } from '../../beatmap/hitObjects/SliderRepeat.ts';
import { SliderTick } from '../../beatmap/hitObjects/SliderTick.ts';
import { OsuAction } from '../../gameplay/OsuAction.ts';
import { DrawableOsuHitObject } from './DrawableOsuHitObject.ts';
import { DrawableSliderBall } from './DrawableSliderBall.ts';
import { DrawableSliderRepeat } from './DrawableSliderRepeat.ts';
import { DrawableSliderTail } from './DrawableSliderTail.ts';
import { DrawableSliderTick } from './DrawableSliderTick.ts';
import { PlayfieldClock } from './PlayfieldClock.ts';

export class SliderInputManager extends Component {
  override get requiresHighFrequencyMousePosition() {
    return true;
  }

  #tracking = false;

  get tracking() {
    return this.#tracking;
  }

  @resolved(PlayfieldClock)
  gameplayClock!: IFrameBasedClock;

  #timeToAcceptAnyKeyAfter: number | null = null;

  #lastPressedActions: OsuAction[] = [];

  #screenSpaceMousePosition: Vec2 | null = null;
  readonly #slider: DrawableSlider;

  constructor(slider: DrawableSlider) {
    super();

    this.#slider = slider;
    slider.hitObjectApplied.addListener(this.#resetState, this);
  }

  #resetState() {
  }

  receivePositionalInputAt(screenSpacePosition: Vec2): boolean {
    return true;
  }

  onMouseMove(e: MouseMoveEvent): boolean {
    this.#screenSpaceMousePosition = e.screenSpaceMousePosition.clone();
    return false;
  }

  override update() {
    super.update();
    this.#updateTracking(this.isMouseInFollowArea(this.tracking));
  }

  postProcessHeadJudgement(head: DrawableSliderHead) {
    if (!head.judged || !head.result?.isHit)
      return;

    if (!this.isMouseInFollowArea(true))
      return;

    const mousePositionInSlider = this.#slider.toLocalSpace(this.#screenSpaceMousePosition!).sub(this.#slider.originPosition);

    let allTicksInRange = true;

    for (const nested of this.#slider.nestedHitObjects) {
      if (!(nested instanceof DrawableOsuHitObject))
        continue;

      // Skip nested objects that are already judged.
      if (nested.judged)
        continue;

      // Stop the process when a nested object is reached that can't be hit before the current time.
      if (nested.hitObject!.startTime > this.time.current)
        break;

      const radius = this.#getFollowRadius(true);
      const objectProgress = clamp((nested.hitObject!.startTime - this.#slider.hitObject!.startTime) / this.#slider.hitObject!.duration, 0, 1);
      const objectPosition = this.#slider.hitObject!.curvePositionAt(objectProgress);

      // When the first nested object that is further outside the follow area is reached,
      // forcefully miss all other nested objects that would otherwise be valid to be hit.
      // This covers a case of a slider overlapping itself that requires tracking to a tick on an outer edge.
      if ((objectPosition.sub(mousePositionInSlider)).lengthSq() > radius * radius) {
        allTicksInRange = false;
        break;
      }
    }

    for (const nested of this.#slider.nestedHitObjects) {
      if (!(nested instanceof DrawableOsuHitObject))
        continue;

      // Skip nested objects that are already judged.
      if (nested.judged)
        continue;

      // Stop the process when a nested object is reached that can't be hit before the current time.
      if (nested.hitObject!.startTime > this.time.current)
        break;

      if (allTicksInRange)
        nested.hitForcefully();
      else
        nested.missForcefully();
    }

    this.#updateTracking(allTicksInRange || this.isMouseInFollowArea(false));
  }

  tryJudgeNestedObject(nestedObject: DrawableOsuHitObject, timeOffset: number) {
    switch (nestedObject.constructor) {
      case DrawableSliderRepeat:
      case DrawableSliderTick:
        if (timeOffset < 0)
          return;

        break;
      case DrawableSliderTail: {
        if (timeOffset < SliderEventGenerator.TAIL_LENIENCY)
          return;

        const lastTick = this.#slider.nestedHitObjects.findLast(o => o.hitObject! instanceof SliderTick || o.hitObject instanceof SliderRepeat);
        if (lastTick?.judged === false)
          return;

        break;
      }
      default:
        return;
    }

    if (!this.#slider.headCircle.judged)
      return;

    if (this.tracking)
      nestedObject.hitForcefully();
    else if (timeOffset >= 0)
      nestedObject.missForcefully();
  }

  isMouseInFollowArea(expanded: boolean): boolean {
    const pos = this.#screenSpaceMousePosition;

    if (!pos)
      return false;

    const radius = this.#getFollowRadius(expanded);

    const followProgress = clamp((this.time.current - this.#slider.hitObject!.startTime) / this.#slider.hitObject!.duration, 0, 1);
    const followCirclePosition = this.#slider.hitObject!.curvePositionAt(followProgress);
    const mousePositionInSlider = this.#slider.toLocalSpace(pos).sub(this.#slider.originPosition);

    return mousePositionInSlider.distanceSq(followCirclePosition) <= radius * radius;
  }

  #getFollowRadius(expanded: boolean): number {
    let radius = this.#slider.hitObject!.radius;

    if (expanded)
      radius *= DrawableSliderBall.FOLLOW_AREA;

    return radius;
  }

  #updateTracking(isValidTrackingPosition: boolean) {
    const wasTracking = this.tracking;

    const headCircleHitAction = this.#getInitialHitAction();

    if (headCircleHitAction == null)
      this.#timeToAcceptAnyKeyAfter = null;

    if (headCircleHitAction !== null && this.#timeToAcceptAnyKeyAfter == null) {
      const otherKey = headCircleHitAction === OsuAction.RightButton ? OsuAction.LeftButton : OsuAction.RightButton;

      // we can start accepting any key once all other keys have been released in the previous frame.
      if (!this.#lastPressedActions.includes(otherKey))
        this.#timeToAcceptAnyKeyAfter = this.time.current;
    }

    if (this.#slider.osuActionInputManager == null)
      return;

    this.#lastPressedActions.length = 0;
    let validTrackingAction = false;

    for (const action of this.#slider.osuActionInputManager.pressedActions) {
      if (this.#isValidTrackingAction(action))
        validTrackingAction = true;

      this.#lastPressedActions.push(action);
    }

    this.#tracking
      // even in an edge case where current time has exceeded the slider's time, we may not have finished judging.
      // we don't want to potentially update from Tracking=true to Tracking=false at this point.
      = (!this.#slider.allJudged || this.time.current <= this.#slider.hitObject!.endTime)
      // in valid position range
      && isValidTrackingPosition
      // valid action
      && validTrackingAction;

    // TODO: Add tracking history
    // if (wasTracking !== this.tracking)
    //   this.#slider.result.trackingHistory.push({ time: this.time.current, tracking: this.tracking });
  }

  #getInitialHitAction() {
    return this.#slider.headCircle?.hitAction ?? null;
  }

  #isValidTrackingAction(action: OsuAction) {
    const hitAction = this.#getInitialHitAction();

    // if the head circle was hit, we may not yet be allowed to accept any key, so we must use the initial hit action.
    if (hitAction !== null && (this.#timeToAcceptAnyKeyAfter == null || this.time.current <= this.#timeToAcceptAnyKeyAfter))
      return action === hitAction;

    return action === OsuAction.LeftButton || action === OsuAction.RightButton;
  }

  resetState() {
    this.#tracking = false;
    this.#timeToAcceptAnyKeyAfter = null;
    this.#lastPressedActions.length = 0;
    this.#screenSpaceMousePosition = null;
  }

  override dispose(isDisposing: boolean = true) {
    super.dispose(isDisposing);

    this.#slider.hitObjectApplied.removeListener(this.#resetState, this);
  }
}
