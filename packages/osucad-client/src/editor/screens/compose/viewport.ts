import {nn} from "@osucad/unison";
import {onUnmounted, watch, watchEffect} from "vue";
import {DrawableHitCircle} from "./drawables/drawableHitCircle";
import {Application, Container} from "pixi.js";
import {useEditor} from "../../createEditor";
import {createConstantSizeContainer} from "./drawables/constantSizeContainer";
import {useElementSize, useEventListener} from "@vueuse/core";
import {createGrid} from "./drawables/grid";
import {ToolManager} from "./tools/toolManager";

export function createViewport(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("webgl2", {
    desynchronized: true,
    powerPreference: "high-performance",
    depth: true,
    antialias: true,
    stencil: true,
    premultipliedAlpha: true,
  })!;

  const app = new Application({
    view: canvas,
    context: ctx,
  });

  const { width, height } = useElementSize(canvas);

  watchEffect(() => {
    app.renderer.resize(width.value, height.value);
  });

  const { container: viewportContainer } = createConstantSizeContainer(
    512,
    384,
    width,
    height,
    50
  );

  const hitObjectContainer = new Container<DrawableHitCircle>();
  app.stage.addChild(viewportContainer);
  viewportContainer.addChild(createGrid(), hitObjectContainer);

  const editor = useEditor()!;

  const { container, clock } = editor;

  container.document.objects.hitObjects.on("change", updateHitObjects);
  onUnmounted(() => {
    container.document.objects.hitObjects.off("change", updateHitObjects);
  });

  const hitObjects = new Map<string, DrawableHitCircle>();

  function updateHitObjects() {
    const shouldRemove = new Set(hitObjects.keys());

    const startTime = clock.currentTimeAnimated - 2000;
    const endTime = clock.currentTimeAnimated + 2000;

    let i = 0;

    for (const hitObject of container.document.objects.hitObjects.getRange(
      startTime,
      endTime
    )) {
      const existing = hitObjects.get(nn(hitObject.id));
      if (existing) {
        existing.update();
        shouldRemove.delete(nn(hitObject.id));

        existing.zIndex = --i;
      } else {
        const drawable = new DrawableHitCircle(hitObject, editor);
        hitObjectContainer.addChild(drawable);
        drawable.update();
        hitObjects.set(nn(hitObject.id), drawable);

        drawable.zIndex = --i;
      }
    }

    hitObjectContainer.sortChildren();

    shouldRemove.forEach((id) => {
      const drawable = hitObjects.get(id)!;
      hitObjectContainer.removeChild(drawable);
      hitObjects.delete(id);
      drawable?.destroy(false);
    });
  }

  watch(() => clock.currentTimeAnimated, updateHitObjects, { immediate: true });

  updateHitObjects();

  useEventListener("mousedown", (e: MouseEvent) => {
    if (e.button !== 0) return;

    const rect = canvas.getBoundingClientRect();

    let { x, y } = viewportContainer.toLocal({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });

    const hitObject = container.document.objects.hitObjects.items.find(
      (hitObject) => {
        const drawable = hitObjects.get(hitObject.id!);
        if (!drawable) return false;

        const dx = hitObject.position.x - x;
        const dy = hitObject.position.y - y;

        return Math.sqrt(dx * dx + dy * dy) < 32;
      }
    );
  });

  const toolManager = new ToolManager(editor, canvas, viewportContainer);

  viewportContainer.addChild(toolManager.overlay);

  return {
    toolManager
  }
}

export type Viewport = ReturnType<typeof createViewport>;
