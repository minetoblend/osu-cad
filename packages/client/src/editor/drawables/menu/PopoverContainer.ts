import {Drawable} from "../Drawable.ts";
import {Menu} from "./Menu.ts";
import {IVec2} from "@osucad/common";
import {Container} from "pixi.js";

export class PopoverContainer extends Drawable {

  constructor() {
    super();
    this.eventMode = "auto";
    this.hitArea = { contains: () => true };
    this.addChild(this.content, this._popoverContainer);
  }

  private _popover?: Menu;

  readonly content = new Container();

  private _popoverContainer = new Container();

  onLoad() {
    this.onpointerdown = () => {
      this.closePopover();
    };
  }

  closePopover() {
    if (this._popover) {
      this._popover.hide(true);
      this._popover = undefined;
    }
  }

  show(position: IVec2, menu: Menu) {
    this.closePopover();
    this._popover = menu;
    menu.position.copyFrom(position);
    this.addChild(menu);
  }

}