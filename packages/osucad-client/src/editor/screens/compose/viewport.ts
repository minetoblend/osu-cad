import {CommandManager} from "@/editor/commands/commandManager";
import {Circle, Vec2} from "@osucad/common";
import {nn} from "@osucad/unison";
import {onUnmounted, ref, watch, watchEffect} from "vue";
import {DrawableHitCircle} from "./drawables/drawableHitCircle";
import {Application, Container, Sprite, Texture} from "pixi.js";
import {useEditor} from "../../createEditor";
import {createConstantSizeContainer} from "./drawables/constantSizeContainer";
import {
  onKeyStroke,
  useElementSize,
  useEventListener,
  useRafFn,
} from "@vueuse/core";
import {createGrid} from "./drawables/grid";
import {DrawableSlider} from "./drawables/drawableSlider";
import {DrawableHitObject} from "./drawables/drawableHitObject";
import {DrawableFollowPoints} from "@/editor/screens/compose/drawables/drawableFollowPoints";

export function createViewport(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("webgl2", {
    // desynchronized: true,
    powerPreference: "high-performance",
    depth: true,
    antialias: true,
    stencil: true,
    premultipliedAlpha: true,
  })!;

  const app = new Application({
    view: canvas,
    context: ctx,
    backgroundColor: 0x000000,
    backgroundAlpha: 1,
  });

  // @ts-ignore
  globalThis.__PIXI_APP__ = app;

  const { width, height } = useElementSize(canvas);

  watchEffect(() => {
    app.renderer.resize(width.value, height.value);
  });

  const { container: viewportContainer, scale: viewportScale } =
    createConstantSizeContainer(512, 384, width, height, 30);

  viewportContainer.interactiveChildren = true;

  const hitObjectContainer = new Container<DrawableHitObject>();
  const followPointContainer = new Container<DrawableFollowPoints>();

  const bg = new Sprite(Texture.WHITE);
  bg.tint = 0xaaaaaa;
  bg.scale.set(512 / 16, 384 / 16);

  viewportContainer.addChild(bg, createGrid(), followPointContainer, hitObjectContainer);

  app.stage.addChild(viewportContainer);

  const mousePos = createMousePos(canvas, viewportContainer);

  const editor = useEditor()!;

  const { container, clock } = editor;

  container.document.objects.hitObjects.on("change", updateHitObjects);
  onUnmounted(() => {
    container.document.objects.hitObjects.off("change", updateHitObjects);
  });

  const hitObjects = new Map<string, DrawableHitObject>();

  function updateHitObjects() {
    const shouldRemove = new Set(hitObjects.keys());

    const startTime = clock.currentTimeAnimated - 2000;
    const endTime = clock.currentTimeAnimated + 2000;

    let i = 0;

    const visibleHitObjects = container.document.objects.hitObjects.getPaddedRange(
      startTime,
      endTime,
      1,
      editor.selection.value,
    );

    visibleHitObjects.sort((a, b) => a.startTime - b.startTime);

    for (const hitObject of visibleHitObjects) {
      const existing = hitObjects.get(nn(hitObject.id));
      if (existing) {
        shouldRemove.delete(nn(hitObject.id));
        existing.zIndex = --i;
      } else {
        const drawable =
          hitObject instanceof Circle
            ? new DrawableHitCircle(hitObject, editor)
            : new DrawableSlider(hitObject, editor, viewportScale);

        hitObjectContainer.addChild(drawable);
        drawable.update();
        hitObjects.set(nn(hitObject.id), drawable);

        drawable.zIndex = --i;
      }
    }

    followPointContainer.children.slice(visibleHitObjects.length - 1).forEach((drawable) => drawable.destroy());
    for (let i = 0; i < visibleHitObjects.length - 1; i++) {
      let first = visibleHitObjects[i];
      let second = visibleHitObjects[i + 1];

      let drawable = followPointContainer.children[i] as DrawableFollowPoints;
      if (!drawable) {
        drawable = new DrawableFollowPoints(first, second, clock);
        followPointContainer.addChild(drawable);
      }
      drawable.start = first;
      drawable.end = second;

      drawable.update(clock.currentTimeAnimated);
    }

    hitObjectContainer.sortChildren();

    shouldRemove.forEach((id) => {
      const drawable = hitObjects.get(id)!;
      hitObjectContainer.removeChild(drawable);
      hitObjects.delete(id);
      drawable?.destroy(false);
    });
  }

  app.ticker.add(() => {
    hitObjectContainer.children.forEach((drawable) => {
      drawable.update();
    });
  });

  watch(
    () => [clock.currentTimeAnimated, editor.selection.value],
    updateHitObjects,
    { immediate: true, deep: true },
  );

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
      },
    );
  });

  onKeyStroke("a", (evt) => {
    if (evt.ctrlKey && !document.activeElement?.matches("input")) {
      evt.preventDefault();
      editor.selection.select(...container.document.objects.hitObjects.items);
    }
  });

  return {
    mousePos,
    stage: viewportContainer,
  };
}

export function createMousePos(
  canvas: HTMLCanvasElement,
  viewportContainer: Container,
) {
  const latestMousePos = ref(Vec2.zero());

  useEventListener("pointermove", (e: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();

    let { x, y } = viewportContainer.toLocal({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });

    latestMousePos.value = Vec2.create(x, y);
  });

  const mousePos = ref(Vec2.zero());

  // useRafFn(() => {
  //   if (!Vec2.equals(mousePos.value, latestMousePos.value))
  //     mousePos.value = latestMousePos.value;
  // });

  return latestMousePos;
}

export type Viewport = ReturnType<typeof createViewport>;
