import type { DragEndEvent, DragEvent, DragStartEvent, MouseDownEvent, ReadonlyDependencyContainer, TouchDownEvent, TouchUpEvent } from 'osucad-framework';
import type { HitObject } from '../../../../hitObjects/HitObject';
import type { IHasSliderVelocity } from '../../../../hitObjects/IHasSliderVelocity';
import type { TimelineHitObjectBlueprint } from './TimelineHitObjectBlueprint';
import { Anchor, Axes, ColorUtils, EasingFunction, FastRoundedBox, MouseButton, resolved } from 'osucad-framework';
import { UpdateHandler } from '../../../../crdt/UpdateHandler';
import { hasRepeats } from '../../../../hitObjects/IHasRepeats';
import { EditorClock } from '../../../EditorClock';
import { Timeline } from '../Timeline';
import { TimelineHitObjectTail } from './TimelineHitObjectTail';

export class SliderVelocityAdjustmentPiece extends TimelineHitObjectTail {
  constructor(blueprint: TimelineHitObjectBlueprint, readonly hitObject: HitObject & IHasSliderVelocity) {
    super(blueprint);
  }

  #dragOffset = 0;

  @resolved(Timeline)
  timeline!: Timeline;

  @resolved(EditorClock)
  editorClock!: EditorClock;

  #dragStartVelocity: number | null = null;

  #dragStartRepeats = 0;

  #longPressOutline!: FastRoundedBox;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.addInternal(
      this.#longPressOutline = new FastRoundedBox({
        relativeSizeAxes: Axes.Both,
        alpha: 0,
        depth: 1,
        cornerRadius: 100,
        anchor: Anchor.Center,
        origin: Anchor.Center,
      }),
    );
  }

  protected override updateColors() {
    super.updateColors();

    this.#longPressOutline.color = ColorUtils.lighten(this.accentColor.value, 0.5);
  }

  override onDragStart(e: DragStartEvent): boolean {
    this.#dragOffset = this.timeline.screenSpacePositionToTime(e.screenSpaceMousePosition) - this.hitObject.endTime;

    this.#dragStartVelocity = this.hitObject.sliderVelocityOverride;
    if (hasRepeats(this.hitObject))
      this.#dragStartRepeats = this.hitObject.repeatCount;

    return true;
  }

  override onDrag(e: DragEvent): boolean {
    let time = this.timeline.screenSpacePositionToTime(e.screenSpaceMousePosition) - this.#dragOffset;

    const alternativeMode = e.shiftPressed || this.#dragFromLongPress;

    if (hasRepeats(this.hitObject)) {
      if (!alternativeMode) {
        this.hitObject.sliderVelocityOverride = this.#dragStartVelocity;

        const numSpans = Math.round(
          (time - this.hitObject.startTime) / this.hitObject.spanDuration,
        );

        this.hitObject.repeatCount = Math.max(0, numSpans - 1);

        return true;
      }

      this.hitObject.repeatCount = this.#dragStartRepeats;
      time = this.editorClock.snap(time);
    }
    else if (!alternativeMode) {
      time = this.editorClock.snap(time);
    }

    const targetDuration = Math.max(0, time - this.hitObject.startTime);

    const velocity = ((this.hitObject.sliderVelocity / this.hitObject.baseVelocity)
      * this.hitObject.duration)
      / targetDuration;

    if (velocity > 0 && Number.isFinite(velocity))
      this.hitObject.sliderVelocityOverride = velocity;

    return true;
  }

  @resolved(UpdateHandler)
  updateHandler!: UpdateHandler;

  override onDragEnd(e: DragEndEvent) {
    this.updateHandler.commit();

    if (this.#dragFromLongPress) {
      this.#longPressOutline.scaleTo(1, 300, EasingFunction.OutExpo);
      this.#longPressOutline.fadeOut(100);
      this.#dragFromLongPress = false;
    }
  }

  #dragFromLongPress = false;

  #touchDown = false;

  override onMouseDown(e: MouseDownEvent): boolean {
    if (e.button === MouseButton.Right && this.#touchDown) {
      this.#dragFromLongPress = true;
      this.#longPressOutline.scaleTo(1.2, 300, EasingFunction.OutExpo);
      this.#longPressOutline.fadeIn(100);
      return true;
    }

    return super.onMouseDown(e);
  }

  override onTouchDown(e: TouchDownEvent): boolean {
    this.#touchDown = true;
    return false;
  }

  override onTouchUp(e: TouchUpEvent) {
    this.schedule(() => this.#touchDown = false);
  }
}
