import {Drawable} from "./Drawable.ts";
import {ISize, Vec2} from "@osucad/common";
import gsap from "gsap";
import {Container} from "pixi.js";

export class ScaleToFitContainer extends Drawable {
  constructor(
    private readonly viewportSize: ISize,
    private readonly contentSize: ISize,
    private readonly padding: number = 0,
    private readonly animated: boolean = false,
  ) {
    super();
    this.addChild(this.content)
  }

  readonly content = new Container();

  onLoad() {
    watchEffect(() => this.update());
  }

  private _isFirstUpdate = true;

  update() {
    const scale = Math.min(
      this.viewportSize.width / (this.contentSize.width + this.padding * 2),
      this.viewportSize.height / (this.contentSize.height + this.padding * 2),
    );
    const position = new Vec2(
      (this.viewportSize.width - this.contentSize.width * scale) / 2,
      (this.viewportSize.height - this.contentSize.height * scale) / 2,
    );
    if (!this.animated || this._isFirstUpdate) {
      this.content.scale.set(scale);
      this.content.position.copyFrom(position);
    } else {
      gsap.to(this.content.scale, {
        x: scale,
        y: scale,
        duration: 0.3,
        ease: "power2.out",
      });
      gsap.to(this.content.position, {
        x: position.x,
        y: position.y,
        duration: 0.3,
        ease: "power2.out",
      });
    }

    this._isFirstUpdate = false;
  }

}