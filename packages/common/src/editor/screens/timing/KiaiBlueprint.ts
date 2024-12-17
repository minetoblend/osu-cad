import type { Graphics } from 'pixi.js';
import type { EffectPoint } from '../../../controlPoints/EffectPoint';
import { GraphicsDrawable } from '@osucad/editor/drawables/GraphicsDrawable';
import { Anchor, Axes, Container, dependencyLoader, resolved } from 'osucad-framework';
import { OsucadSpriteText } from '../../../drawables/OsucadSpriteText';
import { ControlPointBlueprint } from '../../ui/timeline/ControlPointBlueprint';
import { Timeline } from '../../ui/timeline/Timeline';
import { KiaiBlueprintGapPlacement } from './KiaiBlueprintGapPlacement';

export class KiaiBlueprint extends ControlPointBlueprint<EffectPoint> {
  constructor() {
    super();
  }

  @dependencyLoader()
  [Symbol('load')]() {
    this.relativeSizeAxes = Axes.Y;
    this.addAllInternal(
      new Container({
        relativeSizeAxes: Axes.X,
        height: 24,
        anchor: Anchor.CenterLeft,
        origin: Anchor.CenterLeft,
        children: [
          new TimelineLayerShape().with({
            relativeSizeAxes: Axes.Both,
          }),
          new OsucadSpriteText({
            text: 'kiai',
            x: 4,
            fontSize: 12,
            anchor: Anchor.CenterLeft,
            origin: Anchor.CenterLeft,
            color: 0x84FFB5,
          }),
        ],
      }),
      new KiaiBlueprintGapPlacement(),
    );
  }

  @resolved(Timeline)
  protected timeline!: Timeline;

  override update() {
    super.update();

    this.x = this.timeline.timeToPosition(this.entry!.lifetimeStart);
    this.width = Math.min(
      this.timeline.durationToSize(this.entry!.lifetimeEnd - this.entry!.lifetimeStart),
      200_000,
    );
  }
}

class TimelineLayerShape extends GraphicsDrawable {
  constructor() {
    super();
  }

  override updateGraphics(g: Graphics) {
    g.clear()
      .roundShape([
        { x: 0, y: 0 },
        { x: this.drawWidth, y: 0 },
        { x: this.drawWidth + 4, y: this.drawHeight / 2 },
        { x: this.drawWidth, y: this.drawHeight },
        { x: 0, y: this.drawHeight },
        { x: -4, y: this.drawHeight / 2 },
      ], 2)
      .fill({
        color: 0x40F589,
        alpha: 0.5,
      })
      .stroke({
        width: 1,
        color: 0x40F589,
      });
  }
}
