import { ObservablePoint, Text } from 'pixi.js';
import { Vec2 } from '@osucad/common';
import { Component } from '../Component.ts';
import { Box } from '../Box.ts';

export interface MenuItemOptions {
  text: string;
  tint?: number;
  action?: () => void;
}

export class MenuItem extends Component {
  constructor(options: MenuItemOptions) {
    super();
    const { text } = options;

    this._text = new Text({
      text,
      tint: options.tint ?? 0xffffff,
      style: {
        fontFamily: 'Nunito Sans',
        fontSize: 16,
        fill: 0xffffff,
      },
    });

    this.addChild(this._background, this._text);

    this._text.position.copyFrom(this.padding);

    this.eventMode = 'static';
    this.onpointerenter = () => {
      this._background.visible = true;
    };
    this.onpointerleave = () => (this._background.visible = false);

    this._action = options.action;

    this.on('pointerdown', (evt) => {
      if (evt.button === 0) {
        this._action?.();
        evt.stopImmediatePropagation();
        evt.preventDefault();
      }
    });
  }

  get padding() {
    return this._padding;
  }

  set padding(value: Vec2) {
    this._padding = value;
    this._text.position.copyFrom(value);
  }

  private readonly _text: Text;

  private _padding = new Vec2(12, 8);

  private _action?: () => void;

  private readonly _background = new Box({
    tint: 0xffffff,
    alpha: 0.2,
    visible: false,
  });

  get preferredSize() {
    return new Vec2(this._text.width, this._text.height).add(
      this.padding.scale(2),
    );
  }

  _onUpdate(point?: ObservablePoint) {
    super._onUpdate(point);
    this._background.setSize(this.size.x, this.size.y);
  }
}
