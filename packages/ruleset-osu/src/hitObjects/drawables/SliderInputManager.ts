import { PlayfieldClock } from "@osucad/core";
import type { MouseMoveEvent } from "@osucad/framework";
import { clamp, Component, resolved, Vec2 } from "@osucad/framework";
import type { DrawableSlider } from "./DrawableSlider";
import type { DrawableSliderHead } from "./DrawableSliderHead";
import { DrawableOsuHitObject } from "./DrawableOsuHitObject";
import { DrawableSliderRepeat } from "./DrawableSliderRepeat";
import { DrawableSliderTick } from "./DrawableSliderTick";
import { DrawableSliderTail } from "./DrawableSliderTail";
import { SliderEventGenerator } from "../SliderEventGenerator";
import { SliderRepeat } from "../SliderRepeat";
import { SliderTick } from "../SliderTick";
import { DrawableSliderBall } from "./DrawableSliderBall";
import { OsuAction } from "../../ui/OsuAction";

export class SliderInputManager extends Component
{
  public tracking = false;

  @resolved(PlayfieldClock, true)
  playfieldClock?: PlayfieldClock;

  #timeToAcceptAnyKeyAfter: number | null = null;
  #screenSpaceMousePosition: Vec2 | null = null;

  readonly #slider: DrawableSlider;

  readonly #lastPressedActions: OsuAction[] = [];

  constructor(drawableSlider: DrawableSlider)
  {
    super();
    this.#slider = drawableSlider;
    drawableSlider.hitObjectApplied.addListener(this.#resetState, this);
  }

  override receivePositionalInputAt(screenSpacePosition: Vec2): boolean
  {
    return true;
  }

  override onMouseMove(e: MouseMoveEvent): boolean
  {
    this.#screenSpaceMousePosition = e.screenSpaceMousePosition;
    return false;
  }

  override update()
  {
    super.update();

    this.#updateTracking(this.isMouseInFollowArea(this.tracking));
  }

  postProcessHeadJudgement(head: DrawableSliderHead)
  {
    if (!head.judged || !head.result!.isHit)
      return;

    if (!this.isMouseInFollowArea(true))
      return;

    console.assert(this.#screenSpaceMousePosition !== null);

    const mousePositionInSlider = this.#slider.toLocalSpace(this.#screenSpaceMousePosition!);//.sub(this.#slider.originPosition);

    let allTicksInRange = true;

    for (const nested of this.#slider.nestedHitObjects)
    {
      if (!(nested instanceof DrawableOsuHitObject))
        continue;

      if (nested.judged)
        continue;

      if (nested.hitObject.startTime > this.time.current)
        break;

      const radius = this.#getFollowRadius(true);
      const objectProgress = clamp((nested.hitObject.startTime - this.#slider.hitObject.startTime) / this.#slider.hitObject.duration, 0, 1);
      const objectPosition = this.#slider.hitObject.curvePositionAt(objectProgress);

      if (objectPosition.distanceSq(mousePositionInSlider) > radius * radius)
      {
        allTicksInRange = false;
        break;
      }
    }

    for (const nested of this.#slider.nestedHitObjects)
    {
      if (!(nested instanceof DrawableOsuHitObject))
        continue;

      if (nested.judged)
        continue;

      if (nested.hitObject.startTime> this.time.current)
        break;

      if (allTicksInRange)
        nested.hitForcefully();
      else
        nested.missForcefully();
    }

    this.#updateTracking(allTicksInRange || this.isMouseInFollowArea(false));
  }

  tryJudgeNestedObject(nestedObject: DrawableOsuHitObject, timeOffset: number)
  {
    if (nestedObject instanceof DrawableSliderRepeat || nestedObject instanceof DrawableSliderTick)
    {
      if (timeOffset < 0)
        return;
    }
    else if (nestedObject instanceof DrawableSliderTail)
    {
      if (timeOffset < SliderEventGenerator.TAIL_LENIENCY)
        return;

      const lastTick = this.#slider.nestedHitObjects.findLast(o => o.hitObject instanceof SliderTick || o.hitObject instanceof SliderRepeat);
      if (lastTick?.judged === false)
        return;
    }
    else
    {
      return;
    }

    if (!this.#slider.sliderHead.judged)
      return;

    if (this.tracking)
      nestedObject.hitForcefully();
    else if (timeOffset >= 0)
      nestedObject.missForcefully();
  }

  isMouseInFollowArea(expanded: boolean)
  {
    if (!this.#screenSpaceMousePosition)
      return false;

    const radius = this.#getFollowRadius(expanded);

    const followProgress = clamp((this.time.current - this.#slider.hitObject.startTime) / this.#slider.hitObject.duration, 0, 1);
    const followCirclePosition = this.#slider.hitObject.curvePositionAt(followProgress);
    const mousePositionInSlider = this.#slider.toLocalSpace(this.#screenSpaceMousePosition);//.sub(this.#slider.originPosition);

    return Vec2.closerThan(mousePositionInSlider, followCirclePosition, radius);
  }

  #getFollowRadius(expanded: boolean): number
  {
    let radius = this.#slider.hitObject.radius;

    if (expanded)
      radius *= DrawableSliderBall.FOLLOW_AREA;

    return radius;
  }

  #updateTracking(isValidTrackingPosition: boolean)
  {
    // TODO: clock is rewinding...

    const headCircleHitAction = this.#getInitialHitAction();

    if (headCircleHitAction === null)
      this.#timeToAcceptAnyKeyAfter = null;

    if (headCircleHitAction !== null && this.#timeToAcceptAnyKeyAfter === null)
    {
      const otherKey = headCircleHitAction == OsuAction.RightButton ? OsuAction.LeftButton : OsuAction.RightButton;

      if (!this.#lastPressedActions.includes(otherKey))
        this.#timeToAcceptAnyKeyAfter = this.time.current;
    }

    if (this.#slider.osuActionInputManager == null)
      return;

    this.#lastPressedActions.length = 0;
    let validTrackingAction = false;

    for (const action of this.#slider.osuActionInputManager.pressedActions)
    {
      if (this.#isValidTrackingAction(action))
        validTrackingAction = true;

      this.#lastPressedActions.push(action);
    }


    this.tracking =
          // even in an edge case where current time has exceeded the slider's time, we may not have finished judging.
          // we don't want to potentially update from Tracking=true to Tracking=false at this point.
          (!this.#slider.allJudged || this.time.current <= this.#slider.hitObject.endTime)
          // in valid position range
          && isValidTrackingPosition
          // valid action
          && validTrackingAction;

  }

  //private OsuAction? getInitialHitAction() => slider.HeadCircle?.HitAction;

  #getInitialHitAction(): OsuAction | null
  {
    return this.#slider.sliderHead.hitAction;
  }

  #isValidTrackingAction(action: OsuAction)
  {
    const hitAction = this.#getInitialHitAction();

    // if the head circle was hit, we may not yet be allowed to accept any key, so we must use the initial hit action.
    if (hitAction !== null && (this.#timeToAcceptAnyKeyAfter === null || this.time.current <= this.#timeToAcceptAnyKeyAfter))
      return action === hitAction;

    return action === OsuAction.LeftButton || action == OsuAction.RightButton;
  }

  #resetState()
  {
    this.tracking = false;
    this.#timeToAcceptAnyKeyAfter = null;
    this.#lastPressedActions.length = 0;
    this.#screenSpaceMousePosition = null;
  }

  override dispose(isDisposing: boolean = true)
  {
    super.dispose(isDisposing);

    this.#slider.hitObjectApplied.removeListener(this.#resetState, this);
  }
}
