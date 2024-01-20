import {Drawable} from "../Drawable.ts";
import {HitObject, Slider} from "@osucad/common";
import {Inject} from "../di";
import {EditorInstance} from "../../editorClient.ts";
import {SelectionCircle} from "./SelectionCircle.ts";

export class SelectionOverlay extends Drawable {

  private readonly drawableMap = new Map<HitObject, HitObjectSelection>();

  @Inject(EditorInstance)
  editor!: EditorInstance;

  onTick() {
    return;
    const selected = this.editor.selection.selectedObjects;
    const shouldRemove = new Set<HitObject>(this.drawableMap.keys());
    for (const obj of selected) {
      shouldRemove.delete(obj);
      if (!this.drawableMap.has(obj)) {
        const drawable = new HitObjectSelection(obj);
        if (drawable) {
          this.drawableMap.set(obj, drawable);
          this.addChild(drawable);
        }
      }
    }
    for (const obj of shouldRemove) {
      const drawable = this.drawableMap.get(obj);
      if (drawable) {
        this.drawableMap.delete(obj);
        this.removeChild(drawable).destroy();
      }
    }
  }
}

class HitObjectSelection extends Drawable {

  startCircle = new SelectionCircle();
  endCircle?: SelectionCircle;

  constructor(readonly hitObject: HitObject) {
    super();
    if (hitObject instanceof Slider)
      this.endCircle = this.addChild(new SelectionCircle());
    this.addChild(this.startCircle);
  }

  onTick() {
    this.position.copyFrom(this.hitObject.stackedPosition);
    this.startCircle.scale.set(this.hitObject.scale);
    if (this.endCircle) {
      this.endCircle.position.copyFrom((this.hitObject as Slider).path.endPosition);
      this.endCircle.scale.set(this.hitObject.scale);
    }
  }
}