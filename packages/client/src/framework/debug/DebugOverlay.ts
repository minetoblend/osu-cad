import { Container, Graphics, Ticker } from 'pixi.js';
import { CompositeDrawable } from '../drawable/CompositeDrawable';
import { Drawable } from '../drawable/Drawable';

export class DebugOverlay extends Container {
  constructor(readonly container: CompositeDrawable) {
    super();

    this.g = new Graphics();
    this.addChild(this.g);
    Ticker.shared.add(this.onUpdate, this);
  }

  g: Graphics;

  onUpdate() {
    const g = this.g;
    g.clear();

    g.save();
    if (this.container.parent) {
      g.transform(this.container.parent.drawNode.worldTransform);
    }

    this.drawDebugRect(g, this.container);

    g.restore();
  }

  drawDebugRect(g: Graphics, drawable: Drawable) {
    g.save();

    g.transform(drawable.drawNode.localTransform);

    g.rect(0, 0, drawable.drawSize.x, drawable.drawSize.y).stroke(0xff0000);

    if (!drawable.margin.isZero) {
      g.rect(
        -drawable.margin.left,
        -drawable.margin.top,
        drawable.drawSize.x + drawable.margin.horizontal,
        drawable.drawSize.y + drawable.margin.vertical,
      ).stroke(0x00ff00);
    }

    if (drawable instanceof CompositeDrawable) {
      if (!drawable.padding.isZero) {
        g.rect(
          drawable.childOffset.x,
          drawable.childOffset.y,
          drawable.childSize.x,
          drawable.childSize.y,
        ).stroke(0xffff00);
      }

      for (const child of drawable.internalChildren) {
        this.drawDebugRect(g, child);
      }
    }

    g.restore();
  }
}
