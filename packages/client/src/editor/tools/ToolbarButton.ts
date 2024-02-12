import {IconButton} from "../drawables/IconButton.ts";
import {Texture} from "pixi.js";

export class ToolbarButton extends IconButton {

  constructor(
    options: {
      icon: Texture,
      action: () => void
    },
  ) {
    super({
      icon: options.icon,
      iconScale: 0.65,
    });
    this.action = options.action;
  }

  action: () => void;

  onLoad() {
    this.onpointerdown = () => {
      this.action();
    };
  }

  private _active = false;

  get active() {
    return this._active;
  }

  set active(value: boolean) {
    this._active = value;
    this.tint = value ? 0x52cca3 : 0xffffff;
  }
}