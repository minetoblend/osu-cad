import type { ReadonlyDependencyContainer } from 'osucad-framework';
import type { Color } from 'pixi.js';
import type { TimelineHitObjectBlueprint } from './TimelineHitObjectBlueprint';
import { Anchor, Axes, Bindable, BindableBoolean, CompositeDrawable, DrawableSprite, FillMode, resolved } from 'osucad-framework';
import { ISkinSource } from '../../../../skinning/ISkinSource';

export class TimelineHitObjectCircle extends CompositeDrawable {
  constructor(readonly blueprint: TimelineHitObjectBlueprint) {
    super();

    this.relativeSizeAxes = Axes.Both;
    this.fillMode = FillMode.Fit;
  }

  protected circle!: DrawableSprite;

  protected overlay!: DrawableSprite;

  protected selectionOverlay!: DrawableSprite;

  @resolved(ISkinSource)
  protected skin!: ISkinSource;

  protected readonly accentColor = new Bindable<Color>(null!);

  protected readonly selected = new BindableBoolean();

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    const scaleCorrection = 64 / 60;

    this.addAllInternal(
      this.circle = new DrawableSprite({
        relativeSizeAxes: Axes.Both,
        texture: this.skin.getTexture('hitcircle'),
        anchor: Anchor.Center,
        origin: Anchor.Center,
        scale: scaleCorrection,
      }),
      this.overlay = new DrawableSprite({
        relativeSizeAxes: Axes.Both,
        texture: this.skin.getTexture('hitcircleoverlay'),
        anchor: Anchor.Center,
        origin: Anchor.Center,
        scale: scaleCorrection,
      }),
      this.selectionOverlay = new DrawableSprite({
        relativeSizeAxes: Axes.Both,
        texture: this.skin.getTexture('hitcircleselect'),
        anchor: Anchor.Center,
        origin: Anchor.Center,
        scale: scaleCorrection,
      }),
    );

    this.accentColor.bindTo(this.blueprint.accentColor);
    this.selected.bindTo(this.blueprint.selected);
  }

  protected override loadComplete() {
    super.loadComplete();

    this.accentColor.addOnChangeListener(color => this.updateColor(color.value), { immediate: true });
    this.selected.addOnChangeListener(selected => this.selectionOverlay.alpha = selected.value ? 1 : 0, { immediate: true });
  }

  protected updateColor(color: Color) {
    this.circle.color = color;
  }
}
