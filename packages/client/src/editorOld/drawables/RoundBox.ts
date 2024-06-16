import { Component } from './Component.ts';
import { Graphics } from 'pixi.js';

export interface BoxOptions {
  tint?: number;
  width?: number;
  height?: number;
  cornerRadius?: number;
}

export class RoundBox extends Component {
  private graphics = new Graphics();

  constructor(options: BoxOptions = {}) {
    super();
    this.addChild(this.graphics);
    this.tint = options.tint ?? 0xffffff;
    this.width = options.width ?? 100;
    this.height = options.height ?? 100;
    this.cornerRadius = options.cornerRadius ?? 0;
  }

  private _cornerRadius = 0;

  get cornerRadius() {
    return this._cornerRadius;
  }

  set cornerRadius(value: number) {
    this._cornerRadius = value;
    this.draw();
  }

  _onUpdate() {
    super._onUpdate();
    this.draw();
  }

  private draw() {
    const g = this.graphics;
    g.clear();
    if (this.width === 0 || this.height === 0) return;

    if (this.cornerRadius > 0) {
      g.roundRect(0, 0, this.size.x, this.size.y);
    } else {
      g.rect(0, 0, this.size.x, this.size.y);
    }
    g.fill(0xffffff);
  }
}
