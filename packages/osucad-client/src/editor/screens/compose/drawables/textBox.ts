import { MaybeComputedRef, resolveUnref } from "@vueuse/core";
import { Graphics, Text } from "pixi.js";
import { Container } from "pixi.js";
import { Ref, watchEffect } from "vue";

export function createTextBox(value: MaybeComputedRef<string | undefined>) {
  const root = new Container();
  const background = new Graphics();
  const textDrawable = new Text("", {
    fill: 0xffffff,
  });
  textDrawable.scale.set(0.3, 0.3);

  root.addChild(background, textDrawable);

  watchEffect(() => {
    const text = resolveUnref(value);

    root.visible = !!text;
    if (!text) return;

    textDrawable.text = text;
    root.visible = true;

    textDrawable.x = -textDrawable.width / 2;
    textDrawable.y = -textDrawable.height / 2;

    const padding = 2;

    background.clear();
    background.beginFill(0x666666, 0.5);
    background.drawRoundedRect(
      -textDrawable.width / 2 - padding,
      -textDrawable.height / 2 - padding,
      textDrawable.width + padding * 2,
      textDrawable.height + padding * 2,
      2
    );
    background.endFill();
  });

  return root;
}
