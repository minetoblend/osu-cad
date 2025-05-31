import type { AutoPlayFrameContext } from "@osucad/core";
import { AutoPlayController, type Playfield, ReplayState } from "@osucad/core";
import type { DrawableOsuHitObject } from "../hitObjects/drawables/DrawableOsuHitObject";
import { clamp, Interpolation, MousePositionAbsoluteInput, type PassThroughInputManager, Vec2 } from "@osucad/framework";
import { DrawableSlider } from "../hitObjects/drawables/DrawableSlider";
import { OsuAction } from "../ui/OsuAction";
import { SliderTick } from "../hitObjects/SliderTick";
import { SliderRepeat } from "../hitObjects/SliderRepeat";
import type { OsuHitObject } from "../hitObjects/OsuHitObject";
import { Slider } from "../hitObjects/Slider";
import { DrawableSliderBall } from "../hitObjects/drawables/DrawableSliderBall";
import { CursorPosition } from "./CursorPosition";
import type { DynamicsParameters } from "./SecondOrderDynamics";
import { DrawableSpinner } from "../hitObjects/drawables/DrawableSpinner";

export class OsuAutoPlayController extends AutoPlayController<DrawableOsuHitObject>
{
  constructor(playfield: Playfield, inputManager: PassThroughInputManager)
  {
    super(playfield, inputManager);
  }

  #currentHitObject?: DrawableOsuHitObject;

  readonly cursorPos = new CursorPosition();

  protected override* process({ current, next }: AutoPlayFrameContext<DrawableOsuHitObject>)
  {

    if (this.#currentHitObject)
    {
      if (!this.#currentHitObject.hitObject || this.time.current > this.#currentHitObject.hitObject.endTime)
      {
        yield new ReplayState([]);
        this.#currentHitObject = undefined;
      }
    }

    if (current instanceof DrawableSpinner && this.isActive(current))
    {
      const angle = (this.time.current - current.hitObject.startTime) * 0.05;

      const spinCount = Math.floor(current.rotationTracker.rotation / Math.PI + 0.5);

      const scaleX = 0.5 + random(new Vec2(spinCount, 0)) * 0.4;
      const scaleY = 0.8 + random(new Vec2(spinCount, 1)) * 0.6;

      const position = new Vec2(256, 192).add(
          new Vec2(0, 75)
            .rotate(angle)
            .mul({ x: scaleX, y: scaleY })
            .rotate(Math.PI * (0.2 + random(new Vec2(spinCount, 12)) * 0.1)),
      );

      yield this.moveCursor(position, {
        frequency: 4 + Math.random(),
        damping: 0.8 + Math.random(),
        response: 0.5,
      });
    }
    else if (current instanceof DrawableSlider && this.isActive(current))
    {
      const position = this.getSliderPosition(current, this.time.current + 36);
      yield this.moveCursor(position, {
        frequency: Math.max(current.hitObject.velocity * 2.5, 5),
        damping: 1,
        response: 0.5,
      });
    }
    else if (current && next)
    {
      const prevPosition = this.getEndPositionWithLeniency(current);
      const nextPosition = next.hitObject.stackedPosition;
      const delta = nextPosition.sub(prevPosition);

      const startTime = this.getLooseEndTime(current.hitObject);
      const endTime = next.hitObject.startTime;
      const duration = endTime - startTime;

      let position = Interpolation.valueAt(
          this.time.current,
          prevPosition.add(nextPosition).scale(0.5),
          nextPosition,
          startTime,
          startTime + Math.min(200, duration * 0.75),
      );

      const mostlyHorizontal = Math.abs(delta.x) > Math.abs(delta.y);

      const completionProgress = clamp((this.time.current - current.hitObject.endTime) / (next.hitObject.startTime - current.hitObject.endTime), 0, 1);

      let frequencyMultiplier = 1;

      if (delta.length() > 125)
      {
        const curveFactor = Math.pow(1 - completionProgress, 2);

        if (mostlyHorizontal)
          position.y -= curveFactor * delta.length() * 0.2;
        else
          position.x -= curveFactor * delta.length() * 0.15;


        frequencyMultiplier *= 1.5;
      }

      position = position.add(new Vec2(
          (random(current.hitObject.position) - 0.5) * current.hitObject.radius * 0.25,
          (random(current.hitObject.position.add({ x: 1, y: 0 })) - 0.5) * current.hitObject.radius * 0.25,
      ));

      const distanceFactor = 1 + Math.log(delta.length() + 1) * 0.05;

      const frequency = duration > 0
          ? (1000 / duration) * 0.75 * distanceFactor * frequencyMultiplier
          : 10;

      const fadeIn = Interpolation.valueAt(
          this.time.current,
          0.15,
          1,
          startTime,
          startTime + Math.min(250, duration * 0.75),
      );


      yield this.moveCursor(position, {
        frequency: Math.max(Math.max(frequency, 0.5) * fadeIn, 2) ,
        damping: 1,
        response: 0.9 * fadeIn,
      });
    }
    else
    {
      const position = next?.hitObject.stackedPosition ?? this.cursorPos.current;

      yield this.moveCursor(position, {
        frequency: 2,
        damping: 0.5,
        response: 0.5,
      });
    }

    if (current && this.didPassStartTime(current))
    {
      this.#currentHitObject = current;
      yield new ReplayState([this.#buttonIndex++ % 2 === 0 ? OsuAction.LeftButton : OsuAction.RightButton]);
    }
  }

  #buttonIndex = 0;

  protected moveCursor(position: Vec2, dynamics: DynamicsParameters)
  {
    position = this.cursorPos.update(position, Math.min(this.time.elapsed, 100), dynamics);
    return new MousePositionAbsoluteInput(this.positionToAbsolute(position));
  }

  protected getLooseEndTime(hitObject: OsuHitObject)
  {
    let endTime = hitObject.endTime;

    if (hitObject instanceof Slider)
    {
      endTime -= 36;
      for (const nested of hitObject.nestedHitObjects)
      {
        if (nested instanceof SliderTick || nested instanceof SliderRepeat)
          endTime = Math.max(endTime, nested.endTime);
      }
    }

    return endTime;
  }

  protected isActive(hitObject: DrawableOsuHitObject)
  {
    return this.time.current >= hitObject.hitObject.startTime && this.time.current < this.getLooseEndTime(hitObject.hitObject);
  }

  protected getEndPositionWithLeniency(hitObject: DrawableOsuHitObject)
  {
    const time = this.getLooseEndTime(hitObject.hitObject);
    if (hitObject instanceof DrawableSlider)
      return this.getSliderPositionExact(hitObject, time);

    return hitObject.hitObject.stackedEndPosition;
  }

  protected getSliderPosition(slider: DrawableSlider, time = this.time.current): Vec2
  {
    return Vec2.lerp(
        this.getSliderPositionExact(slider, time),
        this.getSliderPositionLoose(slider, time),
        0.5,
    );
  }

  protected getSliderPositionExact(slider: DrawableSlider, time = this.time.current): Vec2
  {
    const completionProgress = clamp((time - slider.hitObject.startTime) / slider.hitObject.duration, 0, 1);

    const curvePosition = slider.hitObject.curvePositionAt(completionProgress);

    return slider.hitObject.stackedPosition.add(curvePosition);
  }

  protected getSliderPositionLoose(slider: DrawableSlider, time = this.time.current)
  {
    const nested = slider.hitObject.nestedHitObjects.toSorted((a, b) => a.startTime - b.startTime) as OsuHitObject[];
    if (time < nested[0].startTime)
      return nested[0].stackedPosition;

    if (time > nested[nested.length - 1].endTime)
      return nested[nested.length - 1].stackedEndPosition;

    for (let i = 1; i < nested.length; i++)
    {
      const prev = nested[i - 1];
      const curr = nested[i];

      if (i === nested.length - 1)
      {
        const radius = curr.radius * DrawableSliderBall.FOLLOW_AREA;
        if (prev.stackedEndPosition.distance(curr.stackedPosition) < radius)
        {
          return prev.stackedEndPosition;
        }
      }

      if (time >= prev.startTime && time < curr.startTime)
      {
        return Interpolation.valueAt(time, prev.stackedPosition, curr.stackedPosition, prev.startTime, curr.startTime);
      }
    }

    return this.getSliderPositionExact(slider, time);
  }

  protected positionToAbsolute(position: Vec2)
  {
    return this.playfield.toScreenSpace(position);
  }
}

function random(st: Vec2): number
{
  const x = Math.sin(new Vec2(12.9898, 78.233).dot(st)) * 43758.5453123;

  return x - Math.floor(x);
}
