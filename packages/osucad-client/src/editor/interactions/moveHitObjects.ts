import { DashLine } from "pixi-dashed-line";
import { Graphics } from "pixi.js";
import {
  onKeyDown,
  useEventListener,
  useKeyModifier,
  useMousePressed,
} from "@vueuse/core";
import { Vec2 } from "@osucad/common";
import { onScopeDispose, ref, watchEffect } from "vue";
import {
  useViewportMousePos,
  useViewportOverlay,
} from "@/editor/screens/compose/tools/composables";
import { MoveHitObjectCommand } from "@/editor/commands/moveHitObject";
import { defineInteraction } from "./defineInteraction";
import { clampHitObjectMovement } from "@/utils/bounds";
import { useNumberValue } from "../screens/compose/tools/composables/value";
import { createTextBox } from "../screens/compose/drawables/textBox";
import { getToolContext } from "../screens/compose/tools/defineTool";

export const MoveHitObjectInteraction = defineInteraction(
  MoveHitObjectCommand,
  (command, finish) => {
    const mousePos = useViewportMousePos();
    const startMousePos = mousePos.value;

    const center = Vec2.average(...command.state.positions);

    const axis = ref<"x" | "y">();

    const text = ref("");

    const { value, stringValue } = useNumberValue(true, ["x", "y"]);

    onKeyDown("x", (e) => (axis.value = axis.value === "x" ? undefined : "x"));
    onKeyDown("y", (e) => (axis.value = axis.value === "y" ? undefined : "y"));

    const textBox = createTextBox(text);
    const overlay = new Graphics();
    useViewportOverlay(overlay, textBox);

    const dashLine = new DashLine(overlay, {});

    const ctrlDown = useKeyModifier("Control");
    const altDown = useKeyModifier("Alt");

    const ctx = getToolContext();

    watchEffect(() => {
      let delta = Vec2.sub(mousePos.value, startMousePos);

      overlay.clear();

      let overlayCenter = center;

      let drawOverlay = true;
      if (axis.value === "x") {
        delta = { x: value.value ?? delta.x, y: 0 };
        overlay.lineStyle(1, 0xea2463, 0.5);
        overlay.moveTo(-10000, center.y);
        overlay.lineTo(10000, center.y);

        text.value = stringValue.value;
        textBox.position.set(center.x + delta.x / 2, center.y - 10);
      } else if (axis.value === "y") {
        delta = { x: 0, y: value.value ?? delta.y };
        overlay.lineStyle(1, 0x63e2b7, 0.5);
        overlay.moveTo(center.x, -10000);
        overlay.lineTo(center.x, 10000);

        textBox.position.set(center.x + 10, center.y + delta.y / 2);
        text.value = stringValue.value;
      } else if (altDown.value) {
        const angle = Math.atan2(delta.y, delta.x);
        const length =
          value.value ?? Math.sqrt(delta.x * delta.x + delta.y * delta.y);
        const roundedAngle =
          Math.round(angle / (Math.PI / 12)) * (Math.PI / 12);

        delta = {
          x: Math.cos(roundedAngle) * length,
          y: Math.sin(roundedAngle) * length,
        };

        text.value = stringValue.value;
        textBox.position.set(center.x + delta.x / 2, center.y + delta.y / 2);
      } else {
        drawOverlay = false;
        text.value = "";
      }

      if (ctrlDown.value) {
        drawOverlay = true;

        let firstPosition = command.state.positions[0];
        let firstHitobject = command.state.hitObjects[0];
        command.state.hitObjects.forEach((hitObject, index) => {
          if (hitObject.startTime < firstHitobject.startTime) {
            firstHitobject = hitObject;
            firstPosition = command.state.positions[index];
          }
        });

        const index = ctx.editor.hitObjects.items.indexOf(firstHitobject);
        const previousHitObject = ctx.editor.hitObjects.items[index - 1];

        if (previousHitObject) {
          let newFirstPos = Vec2.add(firstPosition, delta);

          let relativeDelta = Vec2.sub(newFirstPos, previousHitObject.position);

          const distance = Vec2.length(relativeDelta);
          const roundingDistance = 40;

          const roundedDistance =
            Math.round(distance / roundingDistance) * roundingDistance;

          for (
            let radius = Math.max(
              roundingDistance,
              roundedDistance - roundingDistance * 3
            );
            radius <= roundedDistance + roundingDistance * 3;
            radius += roundingDistance
          ) {
            const alpha =
              1 - Math.abs(radius - roundedDistance) / (roundingDistance * 4);

            overlay.lineStyle(1, 0xffffff, alpha * 0.25);
            overlay.drawCircle(
              previousHitObject.position.x,
              previousHitObject.position.y,
              radius
            );
          }

          relativeDelta = Vec2.scale(relativeDelta, roundedDistance / distance);

          newFirstPos = Vec2.add(previousHitObject.position, relativeDelta);

          delta = Vec2.sub(newFirstPos, center);

          text.value = `${roundedDistance}`;
          textBox.position.set(center.x + delta.x / 2, center.y + delta.y / 2);
          overlayCenter = previousHitObject.position;
        }
      }

      overlay.visible = drawOverlay;

      if (drawOverlay) {
        overlay.lineStyle(1.5, 0xffffff, 0.5);
        overlay.drawCircle(overlayCenter.x, overlayCenter.y, 3);
        overlay.drawCircle(center.x + delta.x, center.y + delta.y, 3);

        dashLine.moveTo(overlayCenter.x, overlayCenter.y);
        dashLine.lineTo(center.x + delta.x, center.y + delta.y);
      }

      delta = clampHitObjectMovement(
        delta,
        command.state.hitObjects,
        command.state.positions
      );

      delta = Vec2.round(delta);

      command.movement.value = delta;
    });

    useEventListener("pointerup", (evt) => {
      if (evt.button === 0) finish();
    });

    onKeyDown("Enter", finish);

    onScopeDispose(() => {
      console.log("dispose: MoveHitObjectInteraction");
    });
  }
);
