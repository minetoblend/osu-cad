import { Component } from './Component.ts';
import { Graphics, ObservablePoint, Rectangle } from 'pixi.js';

export class Button extends Component {
  private readonly graphics = new Graphics();

  constructor() {
    super();
    this.addChild(this.graphics);
    this.eventMode = 'static';
  }

  _onUpdate(point?: ObservablePoint) {
    super._onUpdate(point);
    this.hitArea = new Rectangle(0, 0, this.size.x, this.size.y);
  }
}
