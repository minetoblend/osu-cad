import type { HitObjectLifetimeEntry } from '../../../../hitObjects/drawables/HitObjectLifetimeEntry';
import { Axes, Bindable, dependencyLoader, FastRoundedBox, resolved } from 'osucad-framework';
import { Color } from 'pixi.js';
import { PoolableDrawableWithLifetime } from '../../../../pooling/PoolableDrawableWithLifetime';
import { ISkinSource } from '../../../../skinning/ISkinSource';
import { Timeline } from '../Timeline';

export class TimelineHitObjectBlueprint extends PoolableDrawableWithLifetime<HitObjectLifetimeEntry> {
  constructor() {
    super();

    this.relativeSizeAxes = Axes.Y;
  }

  readonly accentColor = new Bindable(new Color(0xFFFFFF));

  @resolved(ISkinSource)
  protected skin!: ISkinSource;

  protected body!: FastRoundedBox;

  @dependencyLoader()
  [Symbol('load')]() {
    this.addAllInternal(
      this.body = new FastRoundedBox({
        relativeSizeAxes: Axes.Both,
        cornerRadius: 100,
      }),
    );

    this.accentColor.addOnChangeListener(() => this.updateColors(), { immediate: true });
  }

  protected override onApply(entry: HitObjectLifetimeEntry) {
    super.onApply(entry);

    if ('comboColorBindable' in entry)
      this.accentColor.bindTo((entry.comboColorBindable as Bindable<Color>));
  }

  protected override onFree(entry: HitObjectLifetimeEntry) {
    super.onFree(entry);

    if ('comboColorBindable' in entry)
      this.accentColor.unbindFrom((entry.comboColorBindable as Bindable<Color>));
  }

  protected updateColors() {
    this.body.color = this.accentColor.value;
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

    this.x = this.timeline.timeToPosition(this.hitObject!.startTime) - this.drawHeight * 0.5;
    this.width = this.timeline.durationToSize(this.hitObject!.duration) + this.drawHeight;
  }
}
