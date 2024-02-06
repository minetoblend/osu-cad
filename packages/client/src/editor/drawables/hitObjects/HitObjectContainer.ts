import {Drawable} from "../Drawable.ts";
import {Inject} from "../di";
import {EditorInstance} from "../../editorClient.ts";
import {HitCircle, HitObject, HitObjectType, Slider, Spinner} from "@osucad/common";
import {HitObjectDrawable} from "./HitObjectDrawable.ts";
import {HitCircleDrawable} from "./HitCircleDrawable.ts";
import {SliderDrawable} from "./SliderDrawable.ts";
import {Container} from "pixi.js";
import {FollowPointsDrawable} from "./FollowPointsDrawable.ts";
import {SelectionOverlay} from "./SelectionOverlay.ts";
import {SpinnerDrawable} from "./SpinnerDrawable.ts";

export class HitObjectContainer extends Drawable {

  @Inject(EditorInstance)
  private readonly editor!: EditorInstance;

  constructor() {
    super();
    this.addChild(this.followPointContainer, this.hitObjectContainer, new SelectionOverlay());
    this.hitObjectContainer.enableRenderGroup();
    this.followPointContainer.enableRenderGroup();
    this.interactiveChildren = false;
    this.eventMode = 'none'
  }

  onLoad() {
    const eventContainer = this.addChildAt(new Container(), 0);
    eventContainer.hitArea = {
      contains: () => true,
    };
    eventContainer.eventMode = "static";

    eventContainer.onpointerdown = (evt) => {
      console.log("clearing selection");
      this.editor.selection.clear();
    };
  }

  get currentTime() {
    return this.editor.clock.currentTimeAnimated;
  }

  get hitObjects() {
    return this.editor.beatmapManager.hitObjects;
  }

  get selection() {
    return this.editor.selection;
  }

  private readonly hitObjectContainer = new Container();
  private readonly hitObjectDrawableMap = new Map<string, HitObjectDrawable>();
  private readonly followPointDrawableMap = new Map<string, FollowPointsDrawable>();

  private readonly followPointContainer = new Container();

  onTick() {
    let startIndex = this.hitObjects.hitObjects.findIndex((h) => h.endTime + 700 > this.currentTime);
    let endIndex = this.hitObjects.hitObjects.findIndex(h => h.startTime - 600 > this.currentTime);

    if (startIndex > 0) startIndex--;
    if (endIndex == -1)
      endIndex = this.hitObjects.hitObjects.length;
    if (endIndex < this.hitObjects.hitObjects.length) endIndex++;
    if (startIndex === -1)
      startIndex = this.hitObjects.hitObjects.length - 1;

    const hitObjects = this.hitObjects.hitObjects.filter((h, i) => (i >= startIndex && i <= endIndex) || h.isSelected);


    const shouldRemove = new Set<string>([...this.hitObjectDrawableMap.keys()]);
    for (let i = 0; i < hitObjects.length; i++) {
      const hitObject = hitObjects[i];
      shouldRemove.delete(hitObject.id);
      let drawable = this.hitObjectDrawableMap.get(hitObject.id);
      if (!drawable) {
        switch (hitObject.type) {
          case HitObjectType.Circle:
            drawable = new HitCircleDrawable(hitObject as HitCircle);
            break;
          case HitObjectType.Slider:
            drawable = new SliderDrawable(hitObject as Slider);
            break;
          case HitObjectType.Spinner:
            drawable = new SpinnerDrawable(hitObject as Spinner);
            break;
          default:
            continue;
        }

        this.hitObjectDrawableMap.set(hitObject.id, drawable);
        this.hitObjectContainer.addChild(drawable);
      }
      drawable.zIndex = hitObjects.length - i;
      
      if (i < hitObjects.length - 1) {

        let followPointDrawable = this.followPointDrawableMap.get(hitObject.id);
        if (!followPointDrawable) {
          followPointDrawable = new FollowPointsDrawable(hitObject, hitObjects[i + 1]);
          this.followPointDrawableMap.set(hitObject.id, followPointDrawable);
          this.followPointContainer.addChild(followPointDrawable);
        } else {
          followPointDrawable.end = hitObjects[i + 1];
        }
        followPointDrawable.zIndex = -i;
      }

    }

    for (const hitObject of shouldRemove) {
      const drawable = this.hitObjectDrawableMap.get(hitObject);
      if (drawable) {
        this.hitObjectDrawableMap.delete(hitObject);
        this.hitObjectContainer.removeChild(drawable);
        drawable.destroy();
      }

      const followPointDrawable = this.followPointDrawableMap.get(hitObject);
      if (followPointDrawable) {
        this.followPointDrawableMap.delete(hitObject);
        this.followPointContainer.removeChild(followPointDrawable);
        followPointDrawable.destroy();
      }
    }
  }

  get visibleHitObjects(): HitObject[] {
    return this.hitObjectContainer.children.map(it => (it as HitObjectDrawable).hitObject);
  }

  get hitObjectDrawables(): HitObjectDrawable[] {
    return this.hitObjectContainer.children as HitObjectDrawable[];
  }

}