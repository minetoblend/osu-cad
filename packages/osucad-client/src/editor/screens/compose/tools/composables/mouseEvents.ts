import { Vec2 } from "@osucad/common";
import { createInjectionState } from "@vueuse/core";
import { Ref } from "vue";

export type ViewportState = {
  mousePos: Ref<Vec2>;
  canvas: HTMLCanvasElement;
};

export const [provideViewportState, useViewport] = createInjectionState(
  (mousePos: Ref<Vec2>, canvas: HTMLCanvasElement) =>
    ({
      mousePos,
      canvas,
    } as ViewportState)
);

export const [provideViewportMousePos, useViewportMousePos] =
  createInjectionState((position: Ref<Vec2>) => position);

export function onViewportMouseDown() {}
