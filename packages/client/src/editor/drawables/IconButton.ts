import {Button} from "./Button.ts";
import {Container, ObservablePoint, Point, Sprite, Texture} from "pixi.js";

export interface IconButtonOptions {
  icon: Texture,
  iconScale?: number,
  action?: () => void
}

export class IconButton extends Button {

  protected readonly content = new Container();
  protected readonly sprite: Sprite;
  iconScale: number;

  constructor(options: IconButtonOptions) {
    super();
    this.sprite = new Sprite({
      texture: options.icon,
      anchor: new Point(0.5, 0.5),
    });
    this.addChild(this.content);
    this.content.addChild(this.sprite);
    this.iconScale = options.iconScale ?? 1;
    if (options.action) {
      this.on('pointerdown', options.action);
    }
  }

  _onUpdate(point?: ObservablePoint) {
    super._onUpdate(point);
    this.content.position.set(this.size.x / 2, this.size.y / 2);
    this.sprite.scale.set(
      Math.min(
        this.size.x / this.sprite.texture.width,
        this.size.y / this.sprite.texture.height,
      ) * this.iconScale,
    );
  }

  get icon() {
    return this.sprite.texture;
  }

  set icon(texture: Texture) {
    this.sprite.texture = texture;
  }

}