import {ComposeTool} from "../ComposeTool.ts";
import {HitObject, Rect, Vec2} from "@osucad/common";
import {rotateHitObjects} from "../../interaction/mirrorHitObjects.ts";
import {getHitObjectPositions} from "../snapping/HitObjectSnapProvider.ts";
import {BitmapText, FederatedPointerEvent, Graphics} from "pixi.js";
import {UndoableInteraction} from "./UndoableInteraction.ts";

export class RotateHitObjectsInteraction extends UndoableInteraction {

  constructor(
    tool: ComposeTool,
    private hitObjects: HitObject[],
  ) {
    super(tool);

    const bounds = new Rect(0, 0, 512, 384);
    const center = bounds.center;

    this.startMousePos = tool.mousePos;
    this.bounds = bounds;
    this.currentAngle = Math.atan2(tool.mousePos.y - center.y, tool.mousePos.x - center.x);
    this.startAngle = this.currentAngle;

    this.addChild(this.visualizer, this.overlayText);
  }

  aroundCenter = true;
  bounds: Rect;
  currentAngle: number;
  startMousePos: Vec2;
  startAngle: number;
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

    if (this.aroundCenter && this.altDown) {
      this.aroundCenter = false;
      const center = this.bounds.center;
      const { startAngle, currentAngle } = this;

      rotateHitObjects(this.editor, selection, startAngle - currentAngle, center);

      const newBounds = Rect.containingPoints(getHitObjectPositions([...this.selection.selectedObjects]))!;
      this.bounds = newBounds;

      rotateHitObjects(this.editor, selection, currentAngle - startAngle, newBounds.center);
    } else if (!this.aroundCenter && !this.altDown) {
      this.aroundCenter = true;
      const center = this.bounds.center;
      const { startAngle, currentAngle } = this;

      rotateHitObjects(this.editor, selection, startAngle - currentAngle, center);

      const newBounds = new Rect(0, 0, 512, 384);
      this.bounds = newBounds;

      rotateHitObjects(this.editor, selection, currentAngle - startAngle, newBounds.center);
    }

    const { bounds, currentAngle: prevAngle, typedChars, startAngle } = this;

    const center = bounds.center;

    const mousePos = this.mousePos;

    let currentAngle = Math.atan2(mousePos.y - center.y, mousePos.x - center.x);
    if ((!typedChars.startsWith("-") && typedChars.length > 0) || typedChars.length > 1) {
      const parsedAngle = parseFloat(typedChars) * Math.PI / 180;
      if (!isNaN(parsedAngle)) {
        currentAngle = parsedAngle + startAngle;
      }
    } else if (!this.shiftDown) {
      const snapAngle = this.ctrlDown ? 15 : 1;

      const degreesSinceStart = (currentAngle - startAngle) * 180 / Math.PI;
      const snapped = Math.round(degreesSinceStart / snapAngle) * snapAngle;
      currentAngle = snapped * Math.PI / 180 + startAngle;
    }
    const delta = currentAngle - prevAngle;
    this.currentAngle = currentAngle;

    rotateHitObjects(this.editor, selection, delta, center);
    this.updateOverlay(center, startAngle, currentAngle);
  }

  private updateOverlay(center: Vec2, startAngle: number, currentAngle: number) {
    const g = this.visualizer;
    const p1 = center.add(new Vec2(1000, 0).rotate(startAngle));
    const p2 = center.add(new Vec2(1000, 0).rotate(currentAngle));

    g.clear()
      .moveTo(p1.x, p1.y)
      .lineTo(center.x, center.y)
      .lineTo(p2.x, p2.y)
      .stroke({
        color: 0xffffff,
        join: "round",
        cap: "round",
        alpha: 0.5,
      })
      .circle(center.x, center.y, 2)
      .fill(0xffffff);

    const textPos = center.add(
      new Vec2(30, 0).rotate((currentAngle + startAngle) / 2),
    );

    this.overlayText.visible = true;
    this.overlayText.position.set(textPos.x, textPos.y);
    this.overlayText.text = `${Math.round((currentAngle - startAngle) * 180 / Math.PI * 10) / 10}°`;
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