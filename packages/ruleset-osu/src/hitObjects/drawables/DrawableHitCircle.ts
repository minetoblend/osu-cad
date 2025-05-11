import { ArmedState, HitResult, HitSampleInfo, ShakeContainer, SkinnableDrawable } from "@osucad/core";
import type { IKeyBindingHandler, KeyBindingAction, KeyBindingPressEvent, ReadonlyDependencyContainer } from "@osucad/framework";
import { Anchor, Axes, CompositeDrawable, EasingFunction } from "@osucad/framework";
import { OsuSkinComponents } from "../../skinning/OsuSkinComponents";
import type { HitCircle } from "../HitCircle";
import { OsuHitObject } from "../OsuHitObject";
import { DrawableOsuHitObject } from "./DrawableOsuHitObject";
import { OsuAction } from "../../ui/OsuAction";

export class DrawableHitCircle extends DrawableOsuHitObject<HitCircle>
{
  get hitAction()
  {
    return this.hitArea.hitAction;
  }

  constructor(initialHitObject?: HitCircle)
  {
    super(initialHitObject);

    this.origin = Anchor.Center;
  }

  private circlePiece!: SkinnableDrawable;
  private approachCircle!: SkinnableDrawable;
  private shakeContainer!: ShakeContainer;
  private hitArea!: HitReceptor;

  get proxiedLayer()
  {
    return this.approachCircle;
  }

  protected override load(dependencies: ReadonlyDependencyContainer)
  {
    super.load(dependencies);

    this.size = OsuHitObject.OBJECT_DIMENSIONS;

    this.internalChildren = [
      this.hitArea = new HitReceptor(
          () =>  !this.allJudged,
          () => this.updateResult(true),
      ),
      this.shakeContainer = new ShakeContainer({
        shakeDuration: 30,
        relativeSizeAxes: Axes.Both,
        children: [
          this.circlePiece = new SkinnableDrawable(this.componentLookup).with({
            relativeSizeAxes: Axes.Both,
            alpha: 0,
          }),
          this.approachCircle = new ProxyableSkinnableDrawable(OsuSkinComponents.ApproachCircle).with({
            relativeSizeAxes: Axes.Both,
            anchor: Anchor.Center,
            origin: Anchor.Center,
            alpha: 0,
            scale: 4,
          }),
        ],
      }),
    ];
  }

  protected override get initialLifetimeOffset(): number
  {
    return this.hitObject.timePreempt;
  }

  protected override updateInitialTransforms()
  {
    // TODO: figure out why we need this
    this.alpha = 1;

    this.circlePiece.fadeInFromZero(this.hitObject.timeFadeIn);

    this.approachCircle.fadeTo(0.9, Math.min(this.hitObject.timeFadeIn * 2, this.hitObject.timePreempt));
    this.approachCircle.scaleTo(1, this.hitObject.timePreempt);
  }

  protected override updateStartTimeTransforms()
  {
    super.updateStartTimeTransforms();

    this.approachCircle.fadeOut(700);
    this.approachCircle.scaleTo(1.1, 150, EasingFunction.Out);
  }

  protected override updateHitStateTransforms(state: ArmedState)
  {
    super.updateHitStateTransforms(state);

    this.delay(800).fadeOut();

    switch (state)
    {
    case ArmedState.Idle:
      this.hitArea.reset();
      break;
    case ArmedState.Miss:
      this.fadeOut(100);
      break;
    default:
      // this.approachCircle.fadeOut();
    }

    this.expire();
  }

  protected override updatePosition()
  {
    this.position = this.hitObject.stackedPosition;
  }

  protected override updateScale()
  {
    this.scale = this.hitObject.scale;
  }

  protected get componentLookup(): OsuSkinComponents
  {
    return OsuSkinComponents.HitCircle;
  }

  public override update()
  {
    super.update();
  }

  public override shake(): void
  {
    this.shakeContainer.shake();
  }

  protected override playSamples()
  {
    const sample = this.skin.getSample(new HitSampleInfo(HitSampleInfo.HIT_NORMAL, HitSampleInfo.BANK_SOFT));

    if (sample)
      sample.play();
  }

  protected override checkForResult(userTriggered: boolean, timeOffset: number)
  {
    super.checkForResult(userTriggered, timeOffset);

    if (!userTriggered)
    {
      if (!this.hitObject.hitWindows!.canBeHit(timeOffset))
      {
        this.applyMinResult();
      }

      return;
    }

    const result = this.resultFor(timeOffset);

    if (result === HitResult.None)
      return;

    this.applyResult(result);
  }

  protected resultFor(timeOffset: number)
  {
    return this.hitObject.hitWindows!.resultFor(timeOffset);
  }
}

class ProxyableSkinnableDrawable extends SkinnableDrawable
{
  override get removeWhenNotAlive()
  {
    return false;
  }
}

class HitReceptor extends CompositeDrawable implements IKeyBindingHandler<OsuAction>
{
  hitAction: OsuAction | null = null;

  constructor(
    readonly canBeHit: () => boolean,
    readonly hit: () => void,
  )
  {
    super();

    this.size = OsuHitObject.OBJECT_DIMENSIONS;

    this.anchor = Anchor.Center;
    this.origin = Anchor.Center;

    this.cornerExponent = 2;
    this.cornerRadius = OsuHitObject.OBJECT_RADIUS;
  }

  readonly isKeyBindingHandler = true;

  override get handlePositionalInput(): boolean
  {
    return true;
  }

  canHandleKeyBinding(binding: KeyBindingAction): boolean
  {
    return binding instanceof OsuAction;
  }

  onKeyBindingPressed(e: KeyBindingPressEvent<OsuAction>): boolean
  {
    if (!this.canBeHit())
      return false;

    switch (e.pressed)
    {
    case OsuAction.LeftButton:
    case OsuAction.RightButton:
      if (this.isHovered)
      {
        this.hit();
        this.hitAction ??= e.pressed;
        return true;
      }
    }

    return false;
  }

  reset()
  {
    this.hitAction = null;
  }
}
