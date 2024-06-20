import { Graphics } from 'pixi.js';
import { dependencyLoader } from '../../framework/di/DependencyLoader';
import {
  ContainerDrawable,
  ContainerDrawableOptions,
} from '../../framework/drawable/ContainerDrawable';
import { Corner } from '../../framework/drawable/Corner';
import { Invalidation } from '../../framework/drawable/Invalidation';
import { Vec2 } from '@osucad/common';
import { Axes } from '../../framework/drawable/Axes';

export class EditorCornerPiece extends ContainerDrawable {
  constructor(
    readonly corner: Corner,
    options: ContainerDrawableOptions = {},
  ) {
    const { children, ...rest } = options;
    super(rest);
    this.addAll(children ?? []);
  }

  backgroundContainer = new ContainerDrawable({
    relativeSizeAxes: Axes.Both,
  });

  contentContainer = new ContainerDrawable({
    relativeSizeAxes: Axes.Both,
  });

  background = new Graphics({
    alpha: 0.7,
    blendMode: 'none',
  });

  outline = new Graphics();

  override get content() {
    return this.contentContainer;
  }

  @dependencyLoader()
  load() {
    this.backgroundContainer.drawNode.addChild(this.background);
    this.backgroundContainer.drawNode.addChild(this.outline);
    this.addInternal(this.backgroundContainer);
    this.addInternal(this.contentContainer);
    this.generateGeometry();
  }

  override handleInvalidations(): void {
    super.handleInvalidations();
    if (this._invalidations & Invalidation.DrawSize) {
      this.generateGeometry();
    }
  }

  generateGeometry() {
    const background = this.background;
    const outline = this.outline;
    this.generateShape(background);
    this.generateShape(outline);

    background.fill({
      color: 0x222228,
    });
    outline.stroke({
      color: 0xb9c6dd,
      width: 0.5,
      alpha: 0.2,
      alignment: 0,
    });

    this.setTransform(background);
    this.setTransform(outline);
  }

  generateShape(g: Graphics) {
    g.clear();
    g.moveTo(0, 0);
    g.lineTo(this.drawSize.x, 0);

    const inset = this.drawSize.y * 0.25;

    const c = new Vec2(this.drawSize.x - inset, this.drawSize.y);
    const a = new Vec2(this.drawSize.x, 0);
    const b = new Vec2(0, this.drawSize.y);

    const extent = 6;

    const ca = c.sub(a).normalize().scale(extent);
    const cb = c.sub(b).normalize().scale(extent);

    const cornerStart = c.sub(ca);
    const cornerEnd = c.sub(cb);

    g.lineTo(cornerStart.x, cornerStart.y);

    g.arcTo(c.x, c.y, cornerEnd.x, cornerEnd.y, extent);

    g.lineTo(cornerEnd.x, cornerEnd.y);

    g.lineTo(0, this.drawSize.y);
    g.lineTo(0, 0);
  }

  setTransform(g: Graphics) {
    switch (this.corner) {
      case Corner.TopLeft:
        g.position.set(0, 0);
        g.scale.set(1, 1);
        break;
      case Corner.TopRight:
        g.pivot.set(this.drawSize.x, 0);
        g.scale.set(-1, 1);
        break;
      case Corner.BottomLeft:
        g.pivot.set(0, this.drawSize.y);
        g.scale.set(1, -1);
        break;
      case Corner.BottomRight:
        g.pivot.set(this.drawSize.x, this.drawSize.y);
        g.scale.set(-1, -1);
        break;
    }
  }
}
