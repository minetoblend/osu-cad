import {ComposeTool} from "../ComposeTool.ts";
import {HitObject, Rect, Slider, updateHitObject, Vec2} from "@osucad/common";
import {BitmapText, FederatedPointerEvent, Graphics} from "pixi.js";
import {UndoableInteraction} from "./UndoableInteraction.ts";
import {clamp} from "@vueuse/core";
import {getHitObjectPositions} from "../snapping/HitObjectSnapProvider.ts";

export class ScaleHitObjectsInteraction extends UndoableInteraction {

  constructor(
    tool: ComposeTool,
    private hitObjects: HitObject[],
  ) {
    super(tool);

    this.startMousePos = tool.mousePos;
    this.center = new Vec2(256, 192);
    this.currentScale = 1;
    this.selectionBounds = Rect.containingPoints(getHitObjectPositions(hitObjects))!;

    this.addChild(this.visualizer, this.overlayText);
  }

  aroundCenter = true;
  center: Vec2;
  selectionBounds: Rect;
  currentScale: number;
  startMousePos: Vec2;
  typedChars = "";

  private visualizer = new Graphics();
  private overlayText = new BitmapText({
    text: "",
    visible: false,
    style: {
      fontFamily: "Nunito Sans",
      fontSize: 15,
      fill: 0xffffff,
    },
  });

  override get acceptsNumberKeys(): boolean {
    return true;
  }

  onMouseDown(event: FederatedPointerEvent) {
    if (event.button === 0) {
      event.stopImmediatePropagation();
      this.complete();
    }
  }

  onTick() {
    const selection = this.hitObjects;

    if (this.altDown && this.aroundCenter) {
      this.aroundCenter = false;

      const { center, selectionBounds, currentScale } = this;
      this.scaleHitObjects(selection, 1 / currentScale, center);
      const newCenter = selectionBounds.center;
      this.scaleHitObjects(selection, currentScale, newCenter);

      this.center = newCenter;
    } else if (!this.altDown && !this.aroundCenter) {
      this.aroundCenter = true;

      const { center, currentScale } = this;
      this.scaleHitObjects(selection, 1 / currentScale, center);
      const newCenter = new Vec2(256, 192);
      this.scaleHitObjects(selection, currentScale, newCenter);

      this.center = newCenter;
    }

    const { center, currentScale: prevScale, selectionBounds, typedChars } = this;

    const mousePos = this.mousePos;

    const startDistance = this.startMousePos.distanceTo(center);
    const currentDistance = mousePos.distanceTo(center);

    let maxScale = 10.0;

    if (selectionBounds.left < center.x) {
      maxScale = Math.min(maxScale, center.x / (center.x - selectionBounds.left));
    }
    if (selectionBounds.right > center.x) {
      maxScale = Math.min(maxScale, (512 - center.x) / (selectionBounds.right - center.x));
    }
    if (selectionBounds.top < center.y) {
      maxScale = Math.min(maxScale, center.y / (center.y - selectionBounds.top));
    }
    if (selectionBounds.bottom > center.y) {
      maxScale = Math.min(maxScale, (384 - center.y) / (selectionBounds.bottom - center.y));
    }

    let currentScale = currentDistance / startDistance;

    if (typedChars) {
      const typedScale = parseFloat(typedChars);
      if (!isNaN(typedScale)) {
        currentScale = typedScale;
      }
    }

    currentScale = clamp(currentScale, 0.1, maxScale);

    this.currentScale = currentScale;

    const delta = currentScale / prevScale;

    this.scaleHitObjects(selection, delta, center);
  }

  private scaleHitObjects(hitObjects: HitObject[], scale: number, center: Vec2) {
    console.log(hitObjects.length);
    for (const hitObject of hitObjects) {
      const position = hitObject.position.sub(center).scale(scale).add(center);

      if (hitObject instanceof Slider) {
        const path = hitObject.path.controlPoints.map(it => {
          return {
            ...it,
            ...Vec2.scale(it, scale),
          };
        });

        this.commandManager.submit(updateHitObject(hitObject, {
          position,
          path,
          expectedDistance: hitObject.expectedDistance * scale,
          velocity: hitObject.velocity * scale,
        }));
      } else {
        this.commandManager.submit(updateHitObject(hitObject, { position }));
      }
    }
  }

  onKeyDown(event: KeyboardEvent): boolean | void {
    this.typedChars = this.handleTypedChars(this.typedChars, event);
  }

  private handleTypedChars(typedChars: string, evt: KeyboardEvent): string {
    const key = evt.key;
    if (key >= "0" && key <= "9") {
      typedChars += key;
    } else if (key === "-") {
      if (typedChars.startsWith("-"))
        typedChars = typedChars.slice(1);
      else
        typedChars = "-" + typedChars;
      typedChars;
    } else if (key === ".") {
      if (!typedChars.includes("."))
        typedChars += key;
    } else if (key === "Backspace") {
      typedChars = typedChars.slice(0, -1);
    }

    return typedChars;
  }
}