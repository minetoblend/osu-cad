import { Assets, Point, Sprite } from 'pixi.js';
import { Drawable } from '../Drawable.ts';
import { ObjectPool } from '../objectPool.ts';

export class DrawableComboNumber extends Drawable {
  private _number: number;

  constructor(number: number) {
    super();
    this._number = number;
    this._update();
  }

  public get number(): number {
    return this._number;
  }

  public set number(number: number) {
    if (number === this._number) return;
    this._number = number;
    this._update();
  }

  static digitSpritePool = Array.from(
    { length: 10 },
    (_, i) =>
      new ObjectPool<Sprite & { digit: number }>(
        () =>
          Object.assign(
            new Sprite({
              texture: Assets.get(`default-${i}`),
              anchor: new Point(0, 0.5),
            }),
            { digit: i },
          ),
        20,
        (sprite) => sprite.destroy(),
      ),
  );

  _update() {
    this.removeChildren().forEach((sprite) =>
      DrawableComboNumber.digitSpritePool[(sprite as any).digit].release(
        sprite as Sprite & { digit: number },
      ),
    );
    const digits = this.number
      .toString()
      .split('')
      .map((digit) => parseInt(digit));
    const sprites = digits.map((digit) =>
      DrawableComboNumber.digitSpritePool[digit].get(),
    );
    const totalWidth = sprites
      .map((sprite) => sprite.width)
      .reduce((a, b) => a + b, 0);
    this.addChild(...sprites);

    let x = -totalWidth / 2;
    for (const sprite of sprites) {
      sprite.x = x;
      x += sprite.width;
    }
  }
}
