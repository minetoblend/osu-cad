import type { Drawable, ReadonlyDependencyContainer } from "@osucad/framework";
import { Anchor, Axes, Container, Lazy, PoolableDrawable, ProxyDrawable, Vec2 } from "@osucad/framework";
import type { JudgementResult } from "./JudgementResult";
import type { HitObject } from "../hitObjects/HitObject";
import { SkinnableDrawable } from "../../skinning/SkinnableDrawable";
import type { DrawableHitObject } from "../hitObjects/drawables/DrawableHitObject";
import { HitResult } from "../scoring/HitResult";
import { HitResultComponentLookup } from "./HitResultComponentLookup";
import { DefaultJudgementPiece } from "./DefaultJudgementPiece";

const judgement_size = 128;

export class DrawableJudgement extends PoolableDrawable
{
  #result: JudgementResult | null = null;

  get result()
  {
    return this.#result;
  }

  #judgedHitObject: HitObject | null = null;

  get judgedHitObject()
  {
    return this.#judgedHitObject;
  }

  override get removeCompletedTransforms(): boolean
  {
    return false;
  }

  #judgementBody: SkinnableDrawable | null = null;

  protected get judgementBody()
  {
    return this.#judgementBody!;
  }

  readonly #aboveHitObjectsContent: Container;

  readonly #proxiedAboveHitObjectsContent: Lazy<Drawable>;

  get proxiedAboveHitObjectsContent()
  {
    return this.#proxiedAboveHitObjectsContent.value;
  }

  constructor()
  {
    super();

    this.size = new Vec2(judgement_size);
    this.origin = Anchor.Center;

    this.internalChildren = [
      this.#aboveHitObjectsContent = new Container({
        depth: -Number.MAX_VALUE,
        relativeSizeAxes: Axes.Both,
      }),
    ];

    this.#proxiedAboveHitObjectsContent = new Lazy(() => new ProxyDrawable(this.#aboveHitObjectsContent));
  }

  protected override load(dependencies: ReadonlyDependencyContainer)
  {
    super.load(dependencies);

    this.#prepareDrawables();
  }

  protected applyHitAnimations()
  {
  }

  protected applyMissAnimations()
  {
  }

  apply(result: JudgementResult, judgedObject?: DrawableHitObject)
  {
    this.#result = result;
    this.#judgedHitObject = judgedObject?.hitObject ?? null;
  }


  protected override freeAfterUse()
  {
    super.freeAfterUse();

    this.#judgedHitObject = null;
  }

  protected override prepareForUse()
  {
    super.prepareForUse();

    this.#runAnimation();
  }

  #runAnimation()
  {
    const result = this.result!;

    this.applyTransformsAt(-Number.MAX_VALUE, true);
    this.clearTransforms(true);
    this.lifetimeStart = result.timeAbsolute;

    this.absoluteSequence(result.timeAbsolute, () =>
    {
      this.judgementBody.resetAnimation();

      switch (result.type)
      {
      case HitResult.None:
        break;
      default:
        if (result.isHit)
          this.applyHitAnimations();
        else
          this.applyMissAnimations();
        break;
      }

      // TODO:
      // if (JudgementBody.Drawable is IAnimatableJudgement animatable)
      //                     animatable.PlayAnimation();

      const lastTransformTime = this.judgementBody.drawable.latestTransformEndTime;
      if (this.lifetimeEnd === Number.MAX_VALUE || lastTransformTime > this.lifetimeEnd)
        this.lifetimeEnd = lastTransformTime;
    });
  }

  #currentDrawableType!: HitResult;

  #prepareDrawables()
  {
    const type = this.result?.type ?? HitResult.Perfect;

    if (type == this.#currentDrawableType)
      return;

    if (this.judgementBody !== null)
      this.removeInternal(this.judgementBody, true);

    this.addInternal(this.#judgementBody = new SkinnableDrawable(new HitResultComponentLookup(type), () => this.createDefaultJudgement(type)));

    // TODO
    // JudgementBody.OnSkinChanged += () =>
    // {
    //     // on a skin change, the child component will update but not get correctly triggered to play its animation (or proxy the newly created content).
    //     // we need to trigger a reinitialisation to make things right.
    //     proxyContent();
    //     runAnimation();
    // };

    this.#currentDrawableType = type;
  }

  protected createDefaultJudgement(result: HitResult): Drawable
  {
    return new DefaultJudgementPiece(result);
  }
}
