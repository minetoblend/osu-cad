import type { HitObjectLifetimeEntry } from '../../../../hitObjects/drawables/HitObjectLifetimeEntry';
import { UpdateHandler } from '@osucad/multiplayer';
import { Axes, Bindable, BindableBoolean, BindableNumber, provide, resolved } from 'osucad-framework';
import { Color } from 'pixi.js';
import { hasComboInformation } from '../../../../hitObjects/IHasComboInformation';
import { PoolableDrawableWithLifetime } from '../../../../pooling/PoolableDrawableWithLifetime';
import { ISkinSource } from '../../../../skinning/ISkinSource';
import { HitObjectSelectionManager } from '../../../screens/compose/HitObjectSelectionManager';
import { Timeline } from '../Timeline';

@provide()
export class TimelineHitObjectBlueprint extends PoolableDrawableWithLifetime<HitObjectLifetimeEntry> {
  constructor() {
    super();

    this.relativePositionAxes = Axes.X;
    this.relativeSizeAxes = Axes.Both;
  }

  readonly = false;

  readonly accentColor = new Bindable(new Color(0xFFFFFF));

  readonly comboIndexBindable = new BindableNumber(0);

  readonly indexInComboBindable = new BindableNumber(0);

  readonly selected = new BindableBoolean(false);

  @resolved(ISkinSource)
  protected currentSkin!: ISkinSource;

  @resolved(HitObjectSelectionManager, true)
  protected selection?: HitObjectSelectionManager;

  readonly startTimeBindable = new BindableNumber(0);

  @resolved(UpdateHandler)
  updateHandler!: UpdateHandler;

  protected override loadComplete() {
    super.loadComplete();

    this.startTimeBindable.bindValueChanged(time => this.x = time.value, true);
  }

  protected override onApply(entry: HitObjectLifetimeEntry) {
    super.onApply(entry);

    this.startTimeBindable.bindTo(entry.hitObject.startTimeBindable);
    if (hasComboInformation(entry.hitObject)) {
      this.comboIndexBindable.bindTo(entry.hitObject.comboIndexBindable);
      this.indexInComboBindable.bindTo(entry.hitObject.indexInComboBindable);
    }

    if (this.selection)
      this.selected.value = this.selection.isSelected(entry.hitObject);

    this.updateComboColor();
  }

  protected override onFree(entry: HitObjectLifetimeEntry) {
    super.onFree(entry);

    this.startTimeBindable.unbindFrom(entry.hitObject.startTimeBindable);
    if (hasComboInformation(entry.hitObject)) {
      this.comboIndexBindable.unbindFrom(entry.hitObject.comboIndexBindable);
      this.indexInComboBindable.unbindFrom(entry.hitObject.indexInComboBindable);
    }
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

  override update() {
    super.update();

    const duration = this.hitObject!.duration;

    if (this.width !== duration)
      this.width = duration;
  }
}
