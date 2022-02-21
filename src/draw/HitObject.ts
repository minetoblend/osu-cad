import {OsuCadContainer, ResourceProvider} from "@/draw/index";
import {HitCircle} from "@/objects/HitCircle";
import {HitObject} from "@/objects/HitObject";
import {Slider} from "@/objects/Slider";
import {PIXI} from "@/pixi";
import {EditorContext} from "@/objects/Editor";
import {clamp} from "@/util/math";
import {animate, Easing} from "@/util/animation";
import {Playfield} from "@/components/screen/compose/playfield";

export abstract class DrawableHitObject<T extends HitObject = HitObject> extends OsuCadContainer {

  constructor(resourceProvider: ResourceProvider, public hitObject: T) {
    super(resourceProvider);
  }

  abstract update(ctx: EditorContext): void

  get timeRelativeToCurrentTime() {
    return this.hitObject.timeRelativeToCurrentTime
  }

  playfield?: Playfield

  onMouseDown(ev: PIXI.InteractionEvent) {
    this.playfield?.onHitObjectMouseDown.next({
      position: ev.data.getLocalPosition(this.playfield),
      button: ev.data.button,
      hitObject: this.hitObject
    })
  }

}

export class DrawableHitCircle extends DrawableHitObject<HitCircle> {
  private readonly hitcircle: PIXI.Sprite;
  private readonly hitcircleOverlay: PIXI.Sprite;
  private readonly approachCircle: PIXI.Sprite;

  private readonly hitCircleContainer: PIXI.Container;


  constructor(resourceProvider: ResourceProvider, hitObject: HitCircle) {
    super(resourceProvider, hitObject);

    this.hitCircleContainer = new PIXI.Container();

    this.hitcircle = new PIXI.Sprite(resourceProvider.hitCircle!)
    this.hitcircle.anchor.set(0.5, 0.5)

    this.hitcircleOverlay = new PIXI.Sprite(resourceProvider.hitCircleOverlay!)
    this.hitcircleOverlay.anchor.set(0.5, 0.5)

    this.approachCircle = new PIXI.Sprite(resourceProvider.approachCircle!)
    this.approachCircle.anchor.set(0.5, 0.5)

    this.position.set(hitObject.position.x, hitObject.position.y)

    this.scale.set(0.25)

    this.hitcircle.tint = 0xa7c1eb
    this.approachCircle.tint = 0xa7c1eb


    this.hitCircleContainer.addChild(this.hitcircle, this.hitcircleOverlay)
    this.addChild(this.hitCircleContainer, this.approachCircle)

    this.on('mousedown', evt => this.onMouseDown(evt))
  }

  update(ctx: EditorContext) {
    const t = this.timeRelativeToCurrentTime
    const fadeinTime = this.hitObject.timeFadeIn
    const preemptTime = this.hitObject.timePreemt

    if (t < 0) { //fade in
      const a = Math.min(fadeinTime * 2, preemptTime)

      this.approachCircle.alpha = clamp((t + a) / a, 0, 1)
      this.approachCircle.scale.set(clamp(4 - ((t + preemptTime)) / preemptTime * 3, 1, 4))
      this.hitCircleContainer.alpha = animate(t, -fadeinTime, 0, 0, 1, Easing.none)
      this.alpha = 1
    } else { //fade out
      this.approachCircle.alpha = animate(t, 0, 700 * 4, 1, 0, Easing.none)
      this.hitCircleContainer.alpha = 1
      this.approachCircle.scale.set(animate(t, 0, 300, 1, 1.1, Easing.outQuint))
      this.alpha = animate(t, 0, 700, 1, 0, Easing.none)
    }

  }
}

export class DrawableSlider extends DrawableHitObject<Slider> {
  update(ctx: EditorContext) {
  }
}