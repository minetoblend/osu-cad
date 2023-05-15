import { Vec2 } from "@osucad/common";
import {
  Bounds,
  Circle,
  Container,
  Graphics,
  Matrix,
  Rectangle,
  Text,
} from "pixi.js";
import { Ref, ref, shallowRef, watch, watchEffect } from "vue";
import { beginDrag, useSelection, useViewportMousePos } from "../composables";

export function createSelectBox() {
  const selection = useSelection();
  const selectBoxRoot = new Container();
  const selectOverlay = new Graphics();
  const root = new Container();

  const bounds = shallowRef<Rectangle>();

  const angle = ref<number>();

  const angleText = createAngleText(angle);

  root.addChild(selectBoxRoot, angleText);

  watchEffect(() => {
    if (angle.value !== undefined) {
      // don't update bounds during rotation
      return;
    }

    const objects = selection.selectedHitObjects;
    if (objects.length === 0) {
      bounds.value = undefined;
      return;
    }

    const newBounds = new Bounds();

    selection.selectedHitObjects.forEach((hitObject) => {
      newBounds.addPoint(hitObject.position);
    });

    bounds.value = newBounds.getRectangle();
  });

  const rotateHandles = [
    selectBoxRotateHandle(),
    selectBoxRotateHandle(),
    selectBoxRotateHandle(),
    selectBoxRotateHandle(),
  ];

  const scaleHandles = [
    selectBoxScaleHandle(),
    selectBoxScaleHandle(),
    selectBoxScaleHandle(),
    selectBoxScaleHandle(),
  ];

  watchEffect(() => {
    selectBoxRoot.rotation = angle.value ?? 0;
  });

  watch(
    bounds,
    (bounds, oldBounds) => {
      selectBoxRoot.visible = !!bounds && bounds.width > 0 && bounds.height > 0;
      if (!bounds) return;

      const center: Vec2 = {
        x: bounds.x + bounds.width / 2,
        y: bounds.y + bounds.height / 2,
      };

      selectBoxRoot.position.set(center.x, center.y);

      const padded = bounds.clone().pad(5 + 28);

      padded.x -= center.x;
      padded.y -= center.y;

      selectOverlay.clear();

      selectOverlay.lineStyle(1.5, 0xf5d442);

      selectOverlay.moveTo(padded.left + 3, padded.top);
      selectOverlay.lineTo(padded.right - 3, padded.top);
      selectOverlay.moveTo(padded.left + 3, padded.bottom);
      selectOverlay.lineTo(padded.right - 3, padded.bottom);
      selectOverlay.moveTo(padded.left, padded.top + 3);
      selectOverlay.lineTo(padded.left, padded.bottom - 3);
      selectOverlay.moveTo(padded.right, padded.top + 3);
      selectOverlay.lineTo(padded.right, padded.bottom - 3);

      rotateHandles[0].position.set(padded.left - 7, padded.top - 7);
      rotateHandles[1].position.set(padded.right + 7, padded.top - 7);
      rotateHandles[2].position.set(padded.left - 7, padded.bottom + 7);
      rotateHandles[3].position.set(padded.right + 7, padded.bottom + 7);

      scaleHandles[0].position.set(padded.left, padded.top);
      scaleHandles[1].position.set(padded.right, padded.top);
      scaleHandles[2].position.set(padded.left, padded.bottom);
      scaleHandles[3].position.set(padded.right, padded.bottom);

      angleText.position.set(
        center.x,
        center.y + Math.sqrt(padded.width ** 2 + padded.height ** 2) / 2 + 15
      );
    },
    { immediate: true }
  );

  selectBoxRoot.addChild(selectOverlay, ...rotateHandles, ...scaleHandles);

  scaleHandles[0].cursor = "nwse-resize";
  scaleHandles[1].cursor = "nesw-resize";
  scaleHandles[2].cursor = "nesw-resize";
  scaleHandles[3].cursor = "nwse-resize";

  const mousePos = useViewportMousePos();

  let scaleAnchor: Vec2;

  let lastBounds: Rectangle;
  let startBounds: Rectangle;
  let offset: Vec2;

  scaleHandles.forEach((handle, index) => {
    handle.on("pointerdown", (e) => {
      e.preventDefault();
      if (
        !bounds.value ||
        bounds.value?.width === 0 ||
        bounds.value?.height === 0
      )
        return;

      if (selection.value.size > 100) {
        // TODO: Show message about not being able to do drag operations on large selections
        return;
      }

      scaleAnchor = {
        x: index % 2 == 0 ? bounds.value.right : bounds.value.left,
        y: index < 2 ? bounds.value.bottom : bounds.value.top,
      };

      const dragStart = {
        x: index % 2 == 0 ? bounds.value.left : bounds.value.right,
        y: index < 2 ? bounds.value.top : bounds.value.bottom,
      };

      offset = Vec2.sub(mousePos.value, dragStart);

      startBounds = new Rectangle(
        scaleAnchor.x,
        scaleAnchor.y,
        dragStart.x - scaleAnchor.x,
        dragStart.y - scaleAnchor.y
      );
      lastBounds = startBounds.clone();

      beginDrag(
        mousePos,
        (e) => {
          const pos = Vec2.sub(mousePos.value, offset);

          const newBounds = new Rectangle(
            scaleAnchor.x,
            scaleAnchor.y,
            pos.x - scaleAnchor.x,
            pos.y - scaleAnchor.y
          );

          if (e.shiftKey) {
            const aspectRatio = startBounds.width / startBounds.height;
            const newAspectRatio = newBounds.width / newBounds.height;

            if (newAspectRatio > aspectRatio) {
              newBounds.height = newBounds.width / aspectRatio;
            } else {
              newBounds.width = newBounds.height * aspectRatio;
            }
          }

          if (e.altKey) {
            const startCenter = {
              x: startBounds.x + startBounds.width / 2,
              y: startBounds.y + startBounds.height / 2,
            };

            const currentCenter = {
              x: newBounds.x + newBounds.width / 2,
              y: newBounds.y + newBounds.height / 2,
            };

            newBounds.x -= currentCenter.x - startCenter.x;
            newBounds.y -= currentCenter.y - startCenter.y;
          }

          if (newBounds.width > 0) {
            if (newBounds.x < 0) {
              newBounds.width += newBounds.x;
              newBounds.x = 0;
            }
            if (newBounds.x + newBounds.width > 512) {
              newBounds.width = 512 - newBounds.x;
            }
          } else {
            if (newBounds.x + newBounds.width < 0) {
              newBounds.width = -newBounds.x;
            }
            if (newBounds.x > 512) {
              newBounds.width = 512 - newBounds.x;
            }
          }

          if (newBounds.height > 0) {
            if (newBounds.y < 0) {
              newBounds.height += newBounds.y;
              newBounds.y = 0;
            }
            if (newBounds.y + newBounds.height > 384) {
              newBounds.height = 384 - newBounds.y;
            }
          } else {
            if (newBounds.y + newBounds.height < 0) {
              newBounds.height = -newBounds.y;
            }
            if (newBounds.y > 384) {
              newBounds.height = 384 - newBounds.y;
            }
          }

          const matrix = new Matrix();
          matrix.translate(-lastBounds.x, -lastBounds.y);
          matrix.scale(
            newBounds.width / lastBounds.width,
            newBounds.height / lastBounds.height
          );
          matrix.translate(newBounds.x, newBounds.y);

          lastBounds = newBounds;

          selection.selectedHitObjects.forEach((o) => {
            const newPos = matrix.apply(o.position, { x: 0, y: 0 });
            o.position = newPos;
          });
        },
        (e) => {}
      );
    });
  });

  let startAngle: number;
  let lastAngle: number;
  let targetAngle: number;

  function mod(a: number, b: number) {
    return ((a % b) + b) % b;
  }
  function angleDifference(a: number, b: number) {
    return mod(a - b + Math.PI, Math.PI * 2) - Math.PI;
  }

  rotateHandles.forEach((handle, index) => {
    handle.on("pointerdown", (e) => {
      e.preventDefault();
      if (
        !bounds.value ||
        bounds.value?.width === 0 ||
        bounds.value?.height === 0
      )
        return;

      if (selection.value.size > 100) {
        // TODO: Show message about not being able to do drag operations on large selections
        return;
      }

      const center = e.altKey
        ? {
            x: 256,
            y: 192,
          }
        : {
            x: bounds.value.x + bounds.value.width / 2,
            y: bounds.value.y + bounds.value.height / 2,
          };

      (handle as any).dragging = true;

      angle.value = 0;
      startAngle = Math.atan2(
        mousePos.value.y - center.y,
        mousePos.value.x - center.x
      );

      lastAngle = startAngle;
      targetAngle = 0;

      beginDrag(
        mousePos,
        (e) => {
          const currentAngle = Math.atan2(
            mousePos.value.y - center.y,
            mousePos.value.x - center.x
          );

          targetAngle += angleDifference(currentAngle, lastAngle);

          let newAngle = targetAngle;

          if (e.ctrlKey) {
            // round to 15 degree increments
            newAngle = Math.round(newAngle / (Math.PI / 12)) * (Math.PI / 12);
          }

          const matrix = new Matrix();
          matrix.translate(-center.x, -center.y);
          matrix.rotate(-angle.value!);
          matrix.rotate(newAngle);
          matrix.translate(center.x, center.y);

          selection.selectedHitObjects.forEach((o) => {
            const newPos = matrix.apply(o.position, { x: 0, y: 0 });
            o.position = newPos;
          });

          angle.value! = newAngle;

          lastAngle = currentAngle;
        },
        () => {
          angle.value = undefined;
          (handle as any).dragging = false;
          handle.alpha = 0;

          selection.selectedHitObjects.forEach((hitObject) => {
            hitObject.position = Vec2.round(hitObject.position);
          });
        }
      );
    });
  });

  return root;
}

function selectBoxScaleHandle() {
  const g = new Graphics();

  g.lineStyle(1.5, 0xf5d442);
  g.drawRoundedRect(-3, -3, 6, 6, 1);

  g.hitArea = new Rectangle(-3, -3, 6, 6);

  g.eventMode = "static";

  return g;
}

function selectBoxRotateHandle() {
  const g = new Graphics();

  g.lineStyle(1.5, 0xf5d442);
  g.drawCircle(0, 0, 4);

  g.hitArea = new Circle(0, 0, 7);

  g.eventMode = "static";

  g.on("mouseenter", () => {
    if (!(g as any).dragging) g.alpha = 1;
  });

  g.on("mouseleave", () => {
    if (!(g as any).dragging) g.alpha = 0;
  });
  g.cursor = "grab";
  g.alpha = 0;

  return g;
}

export function createAngleText(angle: Ref<number | undefined>) {
  const root = new Container();
  const background = new Graphics();
  const text = new Text("", {
    fill: 0xffffff,
  });
  text.scale.set(0.3, 0.3);

  root.addChild(background, text);

  watchEffect(() => {
    if (angle.value !== undefined) {
      text.text = ((angle.value * 180) / Math.PI).toFixed(1) + "°";
      root.visible = true;

      text.x = -text.width / 2;
      text.y = -text.height / 2;

      const padding = 2;

      background.clear();
      background.beginFill(0x666666, 0.5);
      background.drawRoundedRect(
        -text.width / 2 - padding,
        -text.height / 2 - padding,
        text.width + padding * 2,
        text.height + padding * 2,
        2
      );
      background.endFill();
    } else {
      root.visible = false;
    }
  });

  return root;
}
