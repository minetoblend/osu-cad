import type { DrawableHitObject, HitObject, HitObjectLifetimeEntry } from '@osucad/common';
import type { IKeyBindingHandler, KeyBindingAction, KeyBindingPressEvent, KeyBindingReleaseEvent, ReadonlyDependencyContainer, ValueChangedEvent } from 'osucad-framework';
import type { IHoldNoteBody } from '../../skinning/default/IHoldNoteBody';
import type { HoldNote } from '../HoldNote';
import { HitResult, ScrollingDirection, SkinnableDrawable } from '@osucad/common';
import { Anchor, Axes, BindableBoolean, Container, ProxyDrawable, Vec2 } from 'osucad-framework';
import { DefaultBodyPiece } from '../../skinning/default/DefaultBodyPiece';
import { ManiaSkinComponentLookup } from '../../skinning/ManiaSkinComponentLookup';
import { ManiaSkinComponents } from '../../skinning/ManiaSkinComponents';
import { ManiaAction } from '../../ui/ManiaAction';
import { HeadNote } from '../HeadNote';
import { HoldNoteBody } from '../HoldNoteBody';
import { TailNote } from '../TailNote';
import { DrawableHoldNoteBody } from './DrawableHoldNoteBody';
import { DrawableHoldNoteHead } from './DrawableHoldNoteHead';
import { DrawableHoldNoteTail } from './DrawableHoldNoteTail';
import { DrawableManiaHitObject } from './DrawableManiaHitObject';

export class DrawableHoldNote extends DrawableManiaHitObject<HoldNote> implements IKeyBindingHandler<ManiaAction> {
  constructor(hitObject?: HoldNote) {
    super(hitObject);
  }

  get head() {
    return this.#headContainer.child;
  }

  get tail() {
    return this.#tailContainer.child;
  }

  get body() {
    return this.#bodyContainer.child;
  }

  #headContainer!: Container<DrawableHoldNoteHead>;
  #tailContainer!: Container<DrawableHoldNoteTail>;
  #bodyContainer!: Container<DrawableHoldNoteBody>;

  #sizingContainer!: Container;

  #maskingContainer!: Container;

  #bodyPiece!: SkinnableDrawable;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    let maskedContents: Container;

    this.addAllInternal(
      this.#sizingContainer = new Container({
        relativeSizeAxes: Axes.Both,
        children: [
          this.#maskingContainer = new Container({
            relativeSizeAxes: Axes.Both,
            child: maskedContents = new Container({
              relativeSizeAxes: Axes.Both,
              masking: true,
            }),
          }),
          this.#headContainer = new Container({
            relativeSizeAxes: Axes.Both,
          }),
        ],
      }),
      this.#bodyContainer = new Container({
        relativeSizeAxes: Axes.Both,
      }),
      this.#bodyPiece = new SkinnableDrawable(new ManiaSkinComponentLookup(ManiaSkinComponents.HoldNoteBody), () => new DefaultBodyPiece().with({
        relativeSizeAxes: Axes.Both,
      })).with({
        relativeSizeAxes: Axes.X,
      }),
      this.#tailContainer = new Container({
        relativeSizeAxes: Axes.Both,
      }),
    );

    maskedContents.addAll(
      new ProxyDrawable(this.#bodyPiece),
      new ProxyDrawable(this.#tailContainer),
    );
  }

  holdStartTime: number | null = null;
  #releaseTime: number | null = null;

  protected override onApply(entry: HitObjectLifetimeEntry) {
    super.onApply(entry);

    this.#sizingContainer.size = Vec2.one();
    this.holdStartTime = null;
    this.#releaseTime = null;
  }

  protected override addNestedHitObject(hitObject: DrawableHitObject) {
    super.addNestedHitObject(hitObject);

    switch (hitObject.constructor) {
      case DrawableHoldNoteHead:
        this.#headContainer.child = hitObject as DrawableHoldNoteHead;
        break;

      case DrawableHoldNoteTail:
        this.#tailContainer.child = hitObject as DrawableHoldNoteTail;
        break;

      case DrawableHoldNoteBody:
        this.#bodyContainer.child = hitObject as DrawableHoldNoteBody;
        break;
    }
  }

  protected override clearNestedHitObjects() {
    super.clearNestedHitObjects();

    this.#headContainer.clear(false);
    this.#tailContainer.clear(false);
    this.#bodyContainer.clear(false);
  }

  protected override createNestedHitObject(hitObject: HitObject): DrawableHitObject | null {
    switch (hitObject.constructor) {
      case TailNote:
        return new DrawableHoldNoteTail(hitObject as TailNote);
      case HeadNote:
        return new DrawableHoldNoteHead(hitObject as HeadNote);
      case HoldNoteBody:
        return new DrawableHoldNoteBody(hitObject as HoldNoteBody);
    }

    return super.createNestedHitObject(hitObject);
  }

  protected override onDirectionChanged(e: ValueChangedEvent<ScrollingDirection>) {
    super.onDirectionChanged(e);

    if (e.value === ScrollingDirection.Up) {
      this.#bodyPiece.anchor = this.#bodyPiece.origin = Anchor.TopLeft;
      this.#sizingContainer.anchor = this.#sizingContainer.origin = Anchor.BottomLeft;
    }
    else {
      this.#bodyPiece.anchor = this.#bodyPiece.origin = Anchor.BottomLeft;
      this.#sizingContainer.anchor = this.#sizingContainer.origin = Anchor.TopLeft;
    }
  }

  override onKilled() {
    super.onKilled();

    (this.#bodyPiece.drawable as unknown as IHoldNoteBody)?.recycle();
  }

  override update() {
    super.update();

    if (this.#releaseTime !== null && this.time.current < this.#releaseTime)
      this.#releaseTime = null;

    if (this.holdStartTime !== null && this.time.current < this.holdStartTime)
      this.holdStartTime = null;

    this.#sizingContainer.padding = {
      top: this.direction.value === ScrollingDirection.Down ? -this.tail.height : 0,
      bottom: this.direction.value === ScrollingDirection.Up ? -this.tail.height : 0,
    };

    this.#maskingContainer.padding = {
      top: this.direction.value === ScrollingDirection.Up ? this.head.height / 2 : 0,
      bottom: this.direction.value === ScrollingDirection.Down ? this.head.height / 2 : 0,
    };

    this.#bodyPiece.y = (this.direction.value === ScrollingDirection.Up ? 1 : -1) * this.head.height / 2;
    this.#bodyPiece.height = this.drawHeight - this.head.height / 2 + this.tail.height / 2;

    if (this.time.current >= this.hitObject.startTime) {
      if (this.head.isHit && this.#releaseTime === null && this.drawHeight > 0) {
        const yOffset = this.direction.value === ScrollingDirection.Up ? -this.y : this.y;
        this.#sizingContainer.height = 1 - yOffset / this.drawHeight;
      }
    }
    else {
      this.#sizingContainer.height = 1;
    }
  }

  protected override checkForResult(userTriggered: boolean, timeOffset: number) {
    if (this.tail.allJudged) {
      if (this.tail.isHit)
        this.applyMaxResult();
      else
        this.missForcefully();

      if (!this.body.allJudged)
        this.body.triggerResult(this.tail.isHit);

      this.#endHold();
    }
  }

  override missForcefully() {
    super.missForcefully();

    this.#endHold();
  }

  readonly isHitting = new BindableBoolean();

  #beginHoldAt(timeOffset: number) {
    if (timeOffset < -this.head.hitObject.hitWindows.windowFor(HitResult.Miss))
      return;

    this.holdStartTime = this.time.current;
    this.isHitting.value = true;
  }

  #endHold() {
    this.holdStartTime = null;
    this.isHitting.value = false;
  }

  readonly isKeyBindingHandler = true;

  canHandleKeyBinding(binding: KeyBindingAction): boolean {
    return binding instanceof ManiaAction;
  }

  onKeyBindingPressed(e: KeyBindingPressEvent<ManiaAction>): boolean {
    if (this.allJudged)
      return false;

    if (e.pressed !== this.action.value)
      return false;

    if (this.time.elapsed < 0)
      return false;

    if (this.checkHittable?.(this, this.time.current) === false)
      return false;

    if (this.time.current > this.tail.hitObject.startTime && !this.tail.hitObject.hitWindows.canBeHit(this.time.current - this.tail.hitObject.startTime))
      return false;

    this.#beginHoldAt(this.time.current - this.head.hitObject.startTime);

    return this.head.updateResult();
  }

  onKeyBindingReleased(e: KeyBindingReleaseEvent<ManiaAction>) {
    if (this.allJudged)
      return;

    if (e.pressed !== this.action.value)
      return;

    if (this.time.elapsed < 0)
      return;

    if (this.holdStartTime !== null) {
      this.tail.updateResult();
      this.body.triggerResult(this.tail.isHit);

      this.#endHold();
      this.#releaseTime = this.time.current;
    }
  }
}
