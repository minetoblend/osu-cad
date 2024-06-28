import {
  Axes,
  Container,
  ContainerOptions,
  Invalidation,
  LayoutMember,
  PIXIGraphics,
  Vec2,
  resolved,
} from "osucad-framework";
import { ThemeColors } from "./ThemeColors";

export interface EditorCornerPieceOptions extends ContainerOptions {
  corner: Corner;
}

export class EditorCornerPiece extends Container {
  constructor(options: EditorCornerPieceOptions) {
    super();
    this.addLayout(this.#graphicsBacking);

    this.drawNode.addChild(this.#background, this.#outline);
    this.addInternal(this.#content);

    this.apply(options);
  }

  #background = new PIXIGraphics();
  #outline = new PIXIGraphics();
  #graphicsBacking = new LayoutMember(Invalidation.DrawSize);

  #content = new Container({
    relativeSizeAxes: Axes.Both,
  });

  #corner: Corner = Corner.TopLeft;

  get corner() {
    return this.#corner;
  }

  set corner(value: Corner) {
    if (this.#corner === value) return;

    this.#corner = value;

    this.#graphicsBacking.invalidate();
  }

  override get content() {
    return this.#content;
  }

  @resolved(ThemeColors)
  theme!: ThemeColors;

  update(): void {
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
      color: this.theme.translucent,
      alpha: 0.5,
    });
    outline.stroke({
      color: 0xb9c6dd,
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

  #setTransform(g: PIXIGraphics) {
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

export enum Corner {
  TopLeft,
  TopRight,
  BottomLeft,
  BottomRight,
}
