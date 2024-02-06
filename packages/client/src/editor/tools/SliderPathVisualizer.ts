import {Assets, Circle, Container, Graphics, Point, Sprite} from "pixi.js";
import {Drawable} from "../drawables/Drawable.ts";
import {HitObject, PathType, Slider} from "@osucad/common";
import {Inject} from "../drawables/di";
import {EditorInstance} from "../editorClient.ts";
import {isMobile} from "../../util/isMobile.ts";

export class SliderPathVisualizer extends Drawable {

  private readonly graphics = new Graphics();
  private readonly handles = new Container();

  constructor() {
    super();
    this.addChild(this.graphics, this.handles);

  }

  onLoad() {
    const onDeleted = (hitObject: HitObject) => {
      if (hitObject.id === this.slider?.id)
        this.slider = null;
    };
    this.editor.beatmapManager.hitObjects.onRemoved.addListener(onDeleted);
    this.once("removed", () => {
      this.editor.beatmapManager.hitObjects.onRemoved.removeListener(onDeleted);
    });
  }

  private _slider: Slider | null = null;

  set slider(slider: Slider | null) {
    if (slider === this._slider) return;
    if (this._slider)
      this._slider.onUpdate.removeListener(this.onSliderUpdate);
    this._slider = slider;
    this.update();
    if (slider)
      slider.onUpdate.addListener(this.onSliderUpdate);
  }

  get slider() {
    return this._slider;
  }

  private onSliderUpdate = () => {
    this.update();
  };

  private update() {
    this.graphics.clear();

    if (!this.slider) {
      this.handles.removeChildren();
      return;
    }

    this.graphics.moveTo(
        this.slider.path.controlPoints[0].x,
        this.slider.path.controlPoints[0].y,
    );
    let tint = getColorForPathType(this.slider.path.controlPoints[0].type);
    for (let i = 0; i < this.slider.path.controlPoints.length; i++) {
      const point = this.slider.path.controlPoints[i];
      this.graphics.lineTo(point.x, point.y)
          .stroke(tint);
      if (point.type != null)
        tint = getColorForPathType(point.type);
    }

    if (this.handles.children.length > this.slider.path.controlPoints.length)
      this.handles.removeChildren(this.slider.path.controlPoints.length);

    for (let i = 0; i < this.slider.path.controlPoints.length; i++) {
      const point = this.slider.path.controlPoints[i];
      if (!this.handles.children[i]) {
        const handle = new SliderPathHandle();
        this.handles.addChild(handle);
        this.installHandleListeners?.(handle, i);
      }
      const handle = this.handles.children[i] as SliderPathHandle;
      handle.position.set(point.x, point.y);
      handle.type = point.type;

    }
  }

  onTick() {
    const slider = this.slider;
    if (!slider) return;
    this.position.copyFrom(slider.stackedPosition);
  }

  installHandleListeners?(handle: SliderPathHandle, index: number): void

  @Inject(EditorInstance)
  protected editor!: EditorInstance;

}

export class SliderPathHandle extends Drawable {

  private readonly circle = new Sprite({
    texture: Assets.get("sliderpath-handle"),
    anchor: new Point(0.5, 0.5),
    scale: isMobile() ? new Point(0.75, 0.75) : new Point(0.3, 0.3),
  });

  constructor() {
    super();
    this.addChild(this.circle);
    this.hitArea = new Circle(0, 0, isMobile() ? 24 : 32 * 0.3);
    this.eventMode = "dynamic";

    this.onpointerenter = () => {
      this.hovered = true;
    };
    this.onpointerleave = () => {
      this.hovered = false;
    };
  }

  set hovered(hovered: boolean) {
    this.scale.set(hovered ? 1.25 : 1);
  }


  set type(type: PathType | null) {
    this.tint = getColorForPathType(type);
  }


}

function getColorForPathType(type: PathType | null) {
  switch (type) {
    case null:
      return 0xcccccc;
    case PathType.Bezier:
      return 0x00ff00;
    case PathType.Catmull:
      return 0xff0000;
    case PathType.PerfectCurve:
      return 0x0000ff;
    case PathType.Linear:
      return 0xffff00;
  }
}