import type { ReadonlyDependencyContainer } from 'osucad-framework';
import type { HitObjectLifetimeEntry } from '../../../../hitObjects/drawables/HitObjectLifetimeEntry';
import type { HitObjectSelectionEvent } from '../../../screens/compose/HitObjectSelectionManager';
import type { TimelineHitObjectTail } from './TimelineHitObjectTail';
import { Axes, Bindable, BindableBoolean, BindableNumber, Container, provide, resolved } from 'osucad-framework';
import { Color } from 'pixi.js';
import { UpdateHandler } from '../../../../crdt/UpdateHandler';
import { hasComboInformation } from '../../../../hitObjects/IHasComboInformation';
import { hasDuration } from '../../../../hitObjects/IHasDuration';
import { hasSliderVelocity } from '../../../../hitObjects/IHasSliderVelocity';
import { PoolableDrawableWithLifetime } from '../../../../pooling/PoolableDrawableWithLifetime';
import { OsuSelectionManager } from '../../../../rulesets/osu/edit/OsuSelectionManager';
import { Slider } from '../../../../rulesets/osu/hitObjects/Slider';
import { SliderRepeat } from '../../../../rulesets/osu/hitObjects/SliderRepeat';
import { ISkinSource } from '../../../../skinning/ISkinSource';
import { HitObjectSelectionManager } from '../../../screens/compose/HitObjectSelectionManager';
import { Timeline } from '../Timeline';
import { DurationAdjustmentPiece } from './DurationAdjustmentPiece';
import { SliderVelocityAdjustmentPiece } from './SliderVelocityAdjustmentPiece';
import { TimelineHitObjectBody } from './TimelineHitObjectBody';
import { TimelineHitObjectHead } from './TimelineHitObjectHead';
import { TimelineRepeatPiece } from './TimelineRepeatPiece';

@provide()
export class TimelineHitObjectBlueprint extends PoolableDrawableWithLifetime<HitObjectLifetimeEntry> {
  constructor() {
    super();

    this.relativePositionAxes = Axes.X;
    this.relativeSizeAxes = Axes.Both;
  }

  readonly = false;

  protected content!: Container;

  readonly accentColor = new Bindable(new Color(0xFFFFFF));

  readonly comboIndexBindable = new BindableNumber(0);

  readonly selected = new BindableBoolean(false);

  @resolved(ISkinSource)
  protected currentSkin!: ISkinSource;

  @resolved(HitObjectSelectionManager, true)
  protected selection?: HitObjectSelectionManager;

  protected body!: TimelineHitObjectBody;

  protected bodyContainer!: Container;

  protected head!: TimelineHitObjectHead;

  protected tail: TimelineHitObjectTail | null = null;

  #repeatContainer!: Container<TimelineRepeatPiece>;

  #tailContainer!: Container;

  readonly startTimeBindable = new BindableNumber(0);

  readonly indexInComboBindable = new BindableNumber(0);

  // protected selectionOutline!: Drawable;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.addAllInternal(
      this.bodyContainer = new Container({
        relativeSizeAxes: Axes.Both,
        children: [
          this.body = new TimelineHitObjectBody(this),
        ],
      }),
      this.#tailContainer = new Container({
        relativeSizeAxes: Axes.Both,
      }),
      this.#repeatContainer = new Container<TimelineRepeatPiece>({
        relativeSizeAxes: Axes.Both,
      }),
      this.head = new TimelineHitObjectHead(this),
    );

    this.startTimeBindable.bindValueChanged(time => this.x = time.value);

    this.comboIndexBindable.valueChanged.addListener(this.updateComboColor, this);
    this.currentSkin.sourceChanged.addListener(this.updateComboColor, this);
    this.updateComboColor();
  }

  protected override loadComplete() {
    super.loadComplete();

    this.selection?.selectionChanged.addListener(this.#selectionChanged, this);
  }

  #selectionChanged(evt: HitObjectSelectionEvent) {
    if (evt.hitObject === this.hitObject)
      this.#updateSelection();
  }

  #updateSelection() {
    this.selected.value = !!this.selection?.isSelected(this.hitObject!);

    // TODO: move this to ruleset or solve this in a non-ruleset specific way
    if (this.selection && this.selection instanceof OsuSelectionManager && this.hitObject instanceof Slider) {
      const slider = this.hitObject as Slider;

      const type = this.selection.getSelectionType(slider);

      const headActive = type === 'head' || type === 0;
      this.head.selectionOverlay.color = headActive ? 0xFF0000 : 0xFFFFFF;

      const tailActive
        = type === slider.spanCount
        || (slider.spanCount % 2 === 0 && type === 'head')
        || (slider.spanCount % 2 === 1 && type === 'tail');

      if (this.tail)
        this.tail.selectionOverlay.color = tailActive ? 0xFF0000 : 0xFFFFFF;

      for (const repeat of this.#repeatContainer.children) {
        const isTail = repeat.repeat.repeatIndex % 2 === 0;

        const isActive = isTail ? tailActive : headActive;
        repeat.selectionOverlay.color = isActive ? 0xFF0000 : 0xFFFFFF;
      }
    }
  }

  protected override onApply(entry: HitObjectLifetimeEntry) {
    super.onApply(entry);

    this.startTimeBindable.bindTo(entry.hitObject.startTimeBindable);
    if (hasComboInformation(entry.hitObject)) {
      this.comboIndexBindable.bindTo(entry.hitObject.comboIndexBindable);
      this.indexInComboBindable.bindTo(entry.hitObject.indexInComboBindable);
    }

    if (hasDuration(entry.hitObject))
      this.#tailContainer.add(this.tail = new DurationAdjustmentPiece(this, entry.hitObject));
    else if (hasSliderVelocity(entry.hitObject))
      this.#tailContainer.add(this.tail = new SliderVelocityAdjustmentPiece(this, entry.hitObject));
    else
      this.tail = null;

    entry.hitObject.defaultsApplied.addListener(this.#defaultsApplied, this);

    if (this.selection)
      this.selected.value = this.selection.isSelected(entry.hitObject);

    this.updateComboColor();
    this.#defaultsApplied();
    this.#updateSelection();
  }

  protected override onFree(entry: HitObjectLifetimeEntry) {
    super.onFree(entry);

    this.startTimeBindable.unbindFrom(entry.hitObject.startTimeBindable);
    if (hasComboInformation(entry.hitObject)) {
      this.comboIndexBindable.unbindFrom(entry.hitObject.comboIndexBindable);
      this.indexInComboBindable.unbindFrom(entry.hitObject.indexInComboBindable);
    }

    entry.hitObject.defaultsApplied.removeListener(this.#defaultsApplied, this);

    this.#tailContainer.clear();
  }

  protected updateComboColor() {
    if (!this.hitObject || !(hasComboInformation(this.hitObject)))
      return;

    this.accentColor.value = this.hitObject.getComboColor(this.currentSkin);
  }

  override get shouldBeAlive(): boolean {
    return true;
  }

  get hitObject() {
    return this.entry?.hitObject ?? null;
  }

  @resolved(Timeline)
  timeline!: Timeline;

  #contentPadding = 0;

  override update() {
    super.update();

    const duration = this.hitObject!.duration;

    if (this.width !== duration)
      this.width = duration;

    const contentPadding = this.drawHeight * 0.5;

    if (this.#contentPadding !== contentPadding) {
      this.bodyContainer.padding = { horizontal: -contentPadding };
      this.#contentPadding = contentPadding;
    }
  }

  @resolved(UpdateHandler)
  updateHandler!: UpdateHandler;

  #defaultsApplied() {
    this.tail?.updateSelection();

    this.#repeatContainer.clear();

    for (const hitObject of this.hitObject!.nestedHitObjects) {
      if (hitObject instanceof SliderRepeat) {
        this.#repeatContainer.add(new TimelineRepeatPiece(this, hitObject).with({
          depth: hitObject.startTime,
        }));
      }
    }
  }

  override dispose(isDisposing: boolean = true) {
    super.dispose(isDisposing);

    this.selection?.selectionChanged.removeListener(this.#selectionChanged, this);
  }
}
