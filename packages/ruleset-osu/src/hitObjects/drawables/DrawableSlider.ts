import type { ArmedState, DrawableHitObject, HitObjectSelectionEvent } from '@osucad/core';
import type { ReadonlyDependencyContainer } from '@osucad/framework';
import type { Slider } from '../Slider';
import { ConfineMode, HitObjectSelectionManager, HitResult, OsucadConfigManager, OsucadSettings, SkinnableDrawable } from '@osucad/core';
import { Anchor, Axes, Bindable, BindableBoolean, clamp, Container, resolved, Vec2 } from '@osucad/framework';
import { OsuSelectionManager } from '../../edit/OsuSelectionManager';
import { DefaultSliderBody } from '../../skinning/default/DefaultSliderBody';
import { OsuSkinComponentLookup } from '../../skinning/stable/OsuSkinComponentLookup';
import { DrawableOsuHitObject } from './DrawableOsuHitObject';
import { DrawableSliderBall } from './DrawableSliderBall';
import { DrawableSliderHead } from './DrawableSliderHead';
import { DrawableSliderRepeat } from './DrawableSliderRepeat';
import { DrawableSliderTail } from './DrawableSliderTail';
import { DrawableSliderTick } from './DrawableSliderTick';
import { PlaySliderBody, SelectionType } from './PlaySliderBody';
import { SliderInputManager } from './SliderInputManager';

export class DrawableSlider extends DrawableOsuHitObject<Slider> {
  constructor() {
    super();

    this.sliderInputManager = new SliderInputManager(this);

    this.origin = Anchor.Center;

    this.ball = new DrawableSliderBall();
    this.ball.alwaysPresent = true;
    this.ball.alpha = 0;
    this.ball.bypassAutoSizeAxes = Axes.Both;
  }

  readonly sliderInputManager: SliderInputManager;

  body!: SkinnableDrawable;

  get sliderBody(): PlaySliderBody | null {
    if (this.body.drawable instanceof PlaySliderBody)
      return this.body.drawable;
    return null;
  }

  readonly ball: DrawableSliderBall;

  #headContainer!: Container;
  #tailContainer!: Container;
  #tickContainer!: Container;
  #repeatContainer!: Container;

  headCircle!: DrawableSliderHead;

  tailCircle!: DrawableSliderTail;

  @resolved(OsucadConfigManager)
  protected config!: OsucadConfigManager;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.config.bindWith(OsucadSettings.HitAnimations, this.hitAnimationsEnabled);
    this.config.bindWith(OsucadSettings.SnakingInSliders, this.snakingInSliders);
    this.config.bindWith(OsucadSettings.SnakingOutSliders, this.snakingOutSliders);

    this.addAllInternal(
      this.sliderInputManager,
      this.body = new SkinnableDrawable(OsuSkinComponentLookup.SliderBody, () => new DefaultSliderBody(), ConfineMode.NoScaling),
      this.#tailContainer = new Container({ relativeSizeAxes: Axes.Both }),
      this.#tickContainer = new Container({ relativeSizeAxes: Axes.Both }),
      this.#repeatContainer = new Container({ relativeSizeAxes: Axes.Both }),
      this.#headContainer = new Container({ relativeSizeAxes: Axes.Both }),
      this.ball,
    );

    this.positionBindable.addOnChangeListener(() => this.position = this.hitObject!.stackedPosition);
    this.stackHeightBindable.addOnChangeListener(() => this.position = this.hitObject!.stackedPosition);
    this.scaleBindable.addOnChangeListener(scale => this.ball.scale = scale.value);

    const selection = dependencies.resolveOptional(HitObjectSelectionManager);
    if (selection instanceof OsuSelectionManager)
      this.selection = selection;
  }

  protected selection?: OsuSelectionManager;

  protected override loadComplete() {
    super.loadComplete();

    this.selection?.selectionChanged?.addListener(this.#selectionChanged, this);
  }

  protected override onApplied() {
    super.onApplied();

    this.pathVersion.value = Number.MAX_VALUE;
    this.pathVersion.bindTo(this.hitObject!.path.version);
  }

  protected override onFreed() {
    super.onFreed();

    this.pathVersion.unbindFrom(this.hitObject!.path.version);
  }

  protected override updateInitialTransforms() {
    this.body.fadeInFromZero(this.hitObject!.timeFadeIn);
  }

  protected override updateStartTimeTransforms() {
    super.updateStartTimeTransforms();

    this.ball.fadeIn();
    this.ball.scaleTo(this.hitObject!.scale);
  }

  readonly hitAnimationsEnabled = new Bindable(false);
  readonly snakingInSliders = new Bindable(false);
  readonly snakingOutSliders = new Bindable(false);

  protected override updateHitStateTransforms(state: ArmedState) {
    super.updateHitStateTransforms(state);

    this.fadeOut(this.hitAnimationsEnabled.value ? 240 : 700);
    this.expire();
  }

  protected override addNestedHitObject(hitObject: DrawableHitObject) {
    super.addNestedHitObject(hitObject);

    switch (hitObject.constructor) {
      case DrawableSliderHead:
        this.headCircle = hitObject as DrawableSliderHead;
        this.#headContainer.add(hitObject);
        break;
      case DrawableSliderTail:
        this.tailCircle = hitObject as DrawableSliderTail;
        this.#tailContainer.add(hitObject);
        break;
      case DrawableSliderTick:
        this.#tickContainer.add(hitObject);
        break;
      case DrawableSliderRepeat:
        hitObject.depth = (hitObject as DrawableSliderRepeat).hitObject!.repeatIndex;
        this.#repeatContainer.add(hitObject);
        break;
    }
  }

  protected override clearNestedHitObjects() {
    super.clearNestedHitObjects();

    this.#headContainer.clear(false);
    this.#tailContainer.clear(false);
    this.#tickContainer.clear(false);
    this.#repeatContainer.clear(false);
  }

  tracking = new BindableBoolean(false);

  override update() {
    super.update();

    this.tracking.value
      = this.alwaysHit
        ? this.time.current > this.hitObject!.startTime && this.time.current < this.hitObject!.endTime
        : this.sliderInputManager.tracking;
  }

  override updateAfterChildren() {
    super.updateAfterChildren();

    const completionProgress = clamp((this.time.current - this.hitObject!.startTime) / this.hitObject!.duration, 0, 1);

    this.ball.updateProgress(completionProgress);
    this.sliderBody?.updateProgress(this.headCircle.isHit || this.alwaysHit ? completionProgress : 0);

    const start = new Vec2();
    const end = this.hitObject!.path.endPosition;

    for (const h of this.#repeatContainer.children as DrawableSliderRepeat[]) {
      h.updatePosition(start, end);
    }
  }

  readonly pathVersion = new Bindable(0);

  override onKilled() {
    super.onKilled();

    this.sliderBody?.recyclePath();
  }

  protected override checkForResult(userTriggered: boolean, timeOffset: number) {
    if (userTriggered || !this.tailCircle.judged || this.time.current < this.hitObject!.endTime)
      return;

    // Classic behaviour means a slider is judged proportionally to the number of nested hitobjects hit. This is the classic osu!stable scoring.
    this.applyResult((r, hitObject) => {
      const totalTicks = hitObject.nestedHitObjects.length;
      const hitTicks = hitObject.nestedHitObjects.filter(h => h.isHit).length;

      if (hitTicks === totalTicks) {
        r.type = HitResult.Great;
      }
      else if (hitTicks === 0) {
        r.type = HitResult.Miss;
      }
      else {
        const hitFraction = hitTicks / totalTicks;
        r.type = hitFraction >= 0.5 ? HitResult.Ok : HitResult.Meh;
      }
    });
  }

  protected override playSamples() {
  }

  #selectionChanged(event: HitObjectSelectionEvent) {
    if (event.hitObject !== this.hitObject || !this.hitObject)
      return;

    if (this.sliderBody) {
      if (event.selected)
        this.sliderBody.selected.value = this.selection!.getSelectionType(this.hitObject!) === 'body' ? SelectionType.Body : SelectionType.HitObject;
      else
        this.sliderBody.selected.value = SelectionType.None;
    }
  }

  override dispose(isDisposing: boolean = true) {
    super.dispose(isDisposing);

    this.selection?.selectionChanged.removeListener(this.#selectionChanged, this);
  }
}
