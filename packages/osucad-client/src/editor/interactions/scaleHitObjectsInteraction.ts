import { ScaleHitObjectsCommand } from "./../commands/scaleHitObjectsCommand";
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

export const ScaleHitObjectsInteraction = defineInteraction(
  ScaleHitObjectsCommand,
  (command, finish) => {
    const mousePos = useViewportMousePos();

    const startDistance = Vec2.distance(mousePos.value, command.center.value);

    const axis = ref<"x" | "y">();

    const text = ref("");

    const { value, stringValue } = useNumberValue(true, ["x", "y"]);

    onKeyDown("x", (e) => (axis.value = axis.value === "x" ? undefined : "x"));
    onKeyDown("y", (e) => (axis.value = axis.value === "y" ? undefined : "y"));

    const textBox = createTextBox(text);
    const overlay = new Graphics();
    useViewportOverlay(overlay, textBox);

    watchEffect(() => {
      const scale =
        Vec2.distance(mousePos.value, command.center.value) / startDistance;

      command.scale.value = {
        x: scale,
        y: scale,
      };
    });

    useEventListener("pointerdown", (evt) => {
      evt.preventDefault();
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
