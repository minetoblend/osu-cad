import type { ContainerOptions } from 'osucad-framework';
import { OsucadColors } from '@osucad/common';
import { Axes, Container, Invalidation, LayoutMember, PIXIGraphics, Vec2 } from 'osucad-framework';
import { Corner } from './Corner';

export interface EditorCornerPieceOptions extends ContainerOptions {
  corner: Corner;
}

export class EditorCornerPiece extends Container {
  constructor(options: EditorCornerPieceOptions) {
    super();
    this.addLayout(this.#graphicsBacking);

    this.drawNode.addChild(this.#background, this.#outline);
    this.addInternal(this.#content);

    this.with(options);
  }

  #background = new PIXIGraphics();
  #outline = new PIXIGraphics();
  #graphicsBacking = new LayoutMember(Invalidation.DrawSize);

  #content = new Container({
    relativeSizeAxes: Axes.Both,
  });

  #corner: Corner = Corner.TopLeft;

  override get autoSizeAxes(): Axes {
    return super.autoSizeAxes;
  }

  override set autoSizeAxes(value: Axes) {
    super.autoSizeAxes = value;
    this.#content.relativeSizeAxes &= ~value;
    this.#content.autoSizeAxes = value;
  }

  override get relativeSizeAxes(): Axes {
    return super.relativeSizeAxes;
  }

  override set relativeSizeAxes(value: Axes) {
    super.relativeSizeAxes = value;
    this.#content.relativeSizeAxes = value;
  }

  get corner() {
    return this.#corner;
  }

  set corner(value: Corner) {
    if (this.#corner === value)
      return;

    this.#corner = value;

    this.#graphicsBacking.invalidate();
  }

  override get content() {
    return this.#content;
  }

  override update(): void {
    super.update();

    if (!this.#graphicsBacking.isValid) {
      this.#updateGraphics();
      this.#graphicsBacking.validate();
    }
  }

  #updateGraphics() {
    const background = this.#background;
    const outline = this.#outline;
    this.#generateShape(background);

    outline.context = background.context;

    background.fill({
      color: OsucadColors.translucent,
      alpha: 0.5,
    });
    outline.stroke({
      color: 0xB9C6DD,
      width: 0.75,
      alpha: 0.2,
      alignment: 0,
    });

    this.#setTransform(background);
    this.#setTransform(outline);
  }

  #generateShape(g: PIXIGraphics) {
    g.clear();
    g.moveTo(0, 0);

    const { drawWidth, drawHeight } = this;

    g.lineTo(drawWidth, 0);

    const inset = drawHeight * 0.25;

    const c = new Vec2(drawWidth - inset, drawHeight);
    const a = new Vec2(drawWidth, 0);
    const b = new Vec2(0, drawHeight);

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

  #setTransform(g: PIXIGraphics) {
    switch (this.corner) {
      case Corner.TopLeft:
        g.position.set(0, 0);
        g.scale.set(1, 1);
        break;
      case Corner.TopRight:
        g.pivot.set(this.drawWidth, 0);
        g.scale.set(-1, 1);
        break;
      case Corner.BottomLeft:
        g.pivot.set(0, this.drawHeight);
        g.scale.set(1, -1);
        break;
      case Corner.BottomRight:
        g.pivot.set(this.drawWidth, this.drawHeight);
        g.scale.set(-1, -1);
        break;
    }
  }

  override onMouseDown(): boolean {
    return true;
  }

  override onHover(): boolean {
    return true;
  }

  override onHoverLost(): boolean {
    return true;
  }
}
