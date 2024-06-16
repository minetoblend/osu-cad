import { BitmapText, Container, FillInput, Text, TextStyle } from 'pixi.js';
import { DependencyContainer } from '../di/DependencyContainer';
import { Vec2 } from '@osucad/common';
import { Anchor } from './Anchor';
import { Drawable, DrawableOptions } from './Drawable';
import {
  Invalidation,
  InvalidationSource,
} from '@/framework/drawable/Invalidation.ts';

export interface DrawableTextOptions extends DrawableOptions {
  text?: string;
  resolution?: number;
  color?: number;
  fontFamily?:
    | 'nunito-sans-400'
    | 'nunito-sans-500'
    | 'nunito-sans-600'
    | 'nunito-sans-700';
  fontSize?: number;
}

export class DrawableText extends Drawable {
  constructor(options: DrawableTextOptions) {
    const { text, resolution, fontFamily, fontSize, color, ...rest } = options;
    super(rest);

    const style = new TextStyle({
      fill: color ?? 0xffffff,
      fontFamily: fontFamily ?? 'nunito-sans-400',
      fontSize: options.fontSize ?? 24,
      lineHeight: 1,
    });

    this.textDrawNode = new BitmapText({
      style,
      resolution: resolution ?? 2,
      anchor: this.textAnchor,
    });
    this.text = text ?? '';
    this.drawNode.addChild(this.textDrawNode);
  }

  override _load(dependencies: DependencyContainer): void {
    super._load(dependencies);
  }

  textDrawNode: BitmapText;

  override drawNode = new Container();

  get text() {
    return this.textDrawNode.text;
  }

  set text(value: string) {
    this.textDrawNode.text = value;
    this.invalidate(
      Invalidation.Geometry | Invalidation.DrawSize,
      InvalidationSource.Self,
      true,
    );
  }

  get color() {
    return this.textDrawNode.style.fill;
  }

  set color(value: FillInput) {
    this.textDrawNode.style.fill = value;
  }

  get textAnchor() {
    const position = new Vec2(0, 0);

    if (this.anchor & Anchor.x1) position.x = 0.5;
    else if (this.anchor & Anchor.x2) position.x = 1;

    if (this.anchor & Anchor.y1) position.y = 0.5;
    else if (this.anchor & Anchor.y2) position.y = 1;

    return position;
  }

  override get drawSize() {
    return new Vec2(this.textDrawNode.width, this.textDrawNode.height).mul({
      x: 1,
      y: 0.8,
    });
  }

  textInvalidations = 0;

  invalidate(
    invalidation: Invalidation,
    source: InvalidationSource = InvalidationSource.Default,
    propagateToParent: boolean = false,
  ) {
    super.invalidate(invalidation, source, propagateToParent);
    if (invalidation & Invalidation.Geometry) {
      this.textInvalidations = 0;
    }
  }

  override handleInvalidations(): void {
    super.handleInvalidations();
  }

  override updateDrawNodeTransform() {
    this.drawNode.position.copyFrom(this.drawPosition);
    this.drawNode.scale.copyFrom(this.scale);
    // the bitmap font is weirdly offset towards the bottom for some reason
    this.textDrawNode.y = -this.textDrawNode.style.fontSize * 0.2;
  }

  update() {
    super.update();
    if (this.textInvalidations === 0) {
      this._invalidations |= Invalidation.Geometry | Invalidation.DrawSize;
      this.textInvalidations++;
    }
  }
}
