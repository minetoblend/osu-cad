import type { ReadonlyDependencyContainer } from '@osucad/framework';
import type { Color } from 'pixi.js';
import type { OsuTimelineHitObjectBlueprint } from './OsuTimelineHitObjectBlueprint';
import { HitObjectSelectionManager, ISkinSource, SkinnableSprite } from '@osucad/core';
import { Anchor, Axes, Bindable, BindableBoolean, CompositeDrawable, resolved } from '@osucad/framework';
import { OsuSelectionManager } from '../OsuSelectionManager';

export class TimelineHitObjectCircle extends CompositeDrawable {
  constructor(readonly blueprint: OsuTimelineHitObjectBlueprint) {
    super();

    this.relativeSizeAxes = Axes.Y;
    this.anchor = Anchor.CenterLeft;
    this.origin = Anchor.Center;
  }

  circle!: SkinnableSprite;

  overlay!: SkinnableSprite;

  selectionOverlay!: SkinnableSprite;

  selection?: OsuSelectionManager;

  @resolved(ISkinSource)
  protected skin!: ISkinSource;

  protected readonly accentColor = new Bindable<Color>(null!);

  protected readonly selected = new BindableBoolean();

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    const scaleCorrection = 64 / 60;

    this.addAllInternal(
      this.circle = new SkinnableSprite('hitcircle', {
        relativeSizeAxes: Axes.Both,
        anchor: Anchor.Center,
        origin: Anchor.Center,
        scale: scaleCorrection,
      }),
      this.overlay = new SkinnableSprite('hitcircleoverlay', {
        relativeSizeAxes: Axes.Both,
        anchor: Anchor.Center,
        origin: Anchor.Center,
        scale: scaleCorrection,
      }),
      this.selectionOverlay = new SkinnableSprite('hitcircleselect', {
        relativeSizeAxes: Axes.Both,
        anchor: Anchor.Center,
        origin: Anchor.Center,
        scale: scaleCorrection,
      }),
    );

    this.accentColor.bindTo(this.blueprint.accentColor);
    this.selected.bindTo(this.blueprint.selected);

    const selectionManager = dependencies.resolveOptional(HitObjectSelectionManager);
    if (selectionManager instanceof OsuSelectionManager)
      this.selection = selectionManager;
  }

  protected override loadComplete() {
    super.loadComplete();

    this.accentColor.bindValueChanged(color => this.updateColor(color.value), true);
    this.selected.bindValueChanged(selected => this.selectionOverlay.alpha = selected.value ? 1 : 0, true);
  }

  protected updateColor(color: Color) {
    this.circle.color = color;
  }

  override update() {
    super.update();

    // noinspection JSSuspiciousNameCombination
    this.width = this.drawHeight;
  }
}
