import type { Drawable, ReadonlyDependencyContainer } from 'osucad-framework';
import type { HitObjectLifetimeEntry } from '../../../../hitObjects/drawables/HitObjectLifetimeEntry';
import type { HitObjectSelectionEvent } from '../../../screens/compose/HitObjectSelectionManager';
import { Anchor, Axes, Bindable, BindableBoolean, BindableNumber, Container, FastRoundedBox, FillMode, provide, resolved } from 'osucad-framework';
import { Color } from 'pixi.js';
import { HitObjectList } from '../../../../beatmap/HitObjectList';
import { UpdateHandler } from '../../../../crdt/UpdateHandler';
import { hasComboInformation } from '../../../../hitObjects/IHasComboInformation';
import { hasDuration } from '../../../../hitObjects/IHasDuration';
import { hasSliderVelocity } from '../../../../hitObjects/IHasSliderVelocity';
import { OsucadColors } from '../../../../OsucadColors';
import { PoolableDrawableWithLifetime } from '../../../../pooling/PoolableDrawableWithLifetime';
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

  protected head!: TimelineHitObjectHead;

  #repeatContainer!: Container;

  #tailContainer!: Container;

  readonly startTimeBindable = new BindableNumber(0);

  readonly indexInComboBindable = new BindableNumber(0);

  protected selectionOutline!: Drawable;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.addInternal(this.content = new Container({
      relativeSizeAxes: Axes.Both,
      children: [
        this.selectionOutline = new Container({
          relativeSizeAxes: Axes.Both,
          padding: -2,
          child: new FastRoundedBox({
            relativeSizeAxes: Axes.Both,
            cornerRadius: 100,
            color: OsucadColors.selection,
          }),
        }),
        this.body = new TimelineHitObjectBody(this),
        this.#tailContainer = new Container({
          relativeSizeAxes: Axes.Both,
          fillMode: FillMode.Fit,
          anchor: Anchor.CenterRight,
          origin: Anchor.CenterRight,
        }),
        this.#repeatContainer = new Container({
          relativeSizeAxes: Axes.Both,
        }),
        this.head = new TimelineHitObjectHead(this),
      ],
    }));

    this.startTimeBindable.addOnChangeListener(time => this.x = time.value);

    this.selected.addOnChangeListener((selected) => {
      if (selected.value)
        this.selectionOutline.show();
      else
        this.selectionOutline.hide();
    }, { immediate: true });

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
      this.selected.value = evt.selected;
  }

  protected override onApply(entry: HitObjectLifetimeEntry) {
    super.onApply(entry);

    this.startTimeBindable.bindTo(entry.hitObject.startTimeBindable);
    if (hasComboInformation(entry.hitObject)) {
      this.comboIndexBindable.bindTo(entry.hitObject.comboIndexBindable);
      this.indexInComboBindable.bindTo(entry.hitObject.indexInComboBindable);
    }

    if (hasDuration(entry.hitObject)) {
      this.#tailContainer.add(new DurationAdjustmentPiece(this, entry.hitObject));
    }
    else if (hasSliderVelocity(entry.hitObject)) {
      this.#tailContainer.add(new SliderVelocityAdjustmentPiece(this, entry.hitObject));
    }

    entry.hitObject.defaultsApplied.addListener(this.#updateRepeats, this);

    if (this.selection)
      this.selected.value = this.selection.isSelected(entry.hitObject);

    this.updateComboColor();
    this.#updateRepeats();
  }

  protected override onFree(entry: HitObjectLifetimeEntry) {
    super.onFree(entry);

    this.startTimeBindable.unbindFrom(entry.hitObject.startTimeBindable);
    if (hasComboInformation(entry.hitObject)) {
      this.comboIndexBindable.unbindFrom(entry.hitObject.comboIndexBindable);
      this.indexInComboBindable.unbindFrom(entry.hitObject.indexInComboBindable);
    }

    entry.hitObject.defaultsApplied.removeListener(this.#updateRepeats, this);

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
      this.content.padding = { horizontal: -contentPadding };
      this.#contentPadding = contentPadding;
    }
  }

  @resolved(HitObjectList)
  hitObjects!: HitObjectList;

  @resolved(UpdateHandler)
  updateHandler!: UpdateHandler;

  #updateRepeats() {
    this.#repeatContainer.clear();

    for (const hitObject of this.hitObject!.nestedHitObjects) {
      if (hitObject instanceof SliderRepeat)
        this.#repeatContainer.add(new TimelineRepeatPiece(this, hitObject));
    }
  }

  override dispose(isDisposing: boolean = true) {
    super.dispose(isDisposing);

    this.selection?.selectionChanged.removeListener(this.#selectionChanged, this);
  }
}
