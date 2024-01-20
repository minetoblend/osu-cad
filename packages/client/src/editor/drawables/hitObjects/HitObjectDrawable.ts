import {Drawable} from "../Drawable.ts";
import {HitObject, Vec2} from "@osucad/common";
import {EditorInstance} from "../../editorClient.ts";
import {Inject} from "../di";
import {DestroyOptions} from "pixi.js";

export abstract class HitObjectDrawable<T extends HitObject = HitObject> extends Drawable {

  protected constructor(readonly hitObject: T) {
    super();
    // this.enableRenderGroup();
    this.hitArea = {
      contains: (x: number, y: number) => {
        return this.hitObject.contains(Vec2.from(this.parent.toLocal({ x, y }, this, undefined, true)));
      },
    };
  }

  private _needsSetup = false;

  onLoad() {
    this.hitObject.onUpdate.addListener(this._markDirty);
    this.setup();
  }

  private _markDirty = () => this._needsSetup = true;

  comboColor = 0xffffff;

  @Inject(EditorInstance)
  editor!: EditorInstance;

  setup() {
    this.scale.set(this.hitObject.scale);
    const comboColors = this.editor.beatmapManager.beatmap.colors;
    this.comboColor = comboColors[this.hitObject.comboIndex % comboColors.length];
  }

  onTick() {
    if (this._needsSetup) {
      this.setup();
      this._needsSetup = false;
    }

    this.position.copyFrom(this.hitObject.stackedPosition);
    for (const mod of this.editor.mods) {
      mod.applyTransform(this);
    }
  }

  destroy(options?: DestroyOptions) {
    super.destroy(options);
    this.hitObject.onUpdate.removeListener(this._markDirty);
  }

}