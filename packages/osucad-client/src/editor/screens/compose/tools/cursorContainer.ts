import { Vec2 } from "@osucad/common";
import { ref } from "vue";
import { Container } from "pixi.js";
import { useSharedCursors } from "@/composables/useSharedCursors";

export function createCursorContainer(
  canvas: HTMLCanvasElement,
  viewportContainer: Container
) {
  const root = new Container();

  const mousePos = ref<Vec2>();

  window.addEventListener("pointermove", (evt) => {
    const rect = canvas.getBoundingClientRect();
    const { x, y } = viewportContainer.toLocal({
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top,
    });

    mousePos.value = viewportContainer.toLocal({ x, y });
  });

  const cursors = useSharedCursors("viewport", mousePos);

  

  return root;
}
