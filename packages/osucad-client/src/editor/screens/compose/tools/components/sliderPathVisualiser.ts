import { PathPoint, PathType, Slider, Vec2 } from "@osucad/common";
import { DashLine } from "pixi-dashed-line";
import { Circle, Container, FederatedPointerEvent, Graphics } from "pixi.js";
import { Ref, reactive, ref, watch, watchEffect } from "vue";
import { beginDrag, useSelection, useViewportMousePos } from "../composables";
import { useViewport } from "../composables/mouseEvents";

export function createSliderPathVisualiser(
  sliderRef: Readonly<Ref<Slider | undefined>>
) {
  const root = new Container();

  const g = new Graphics();

  const selection = useSelection();

  const dashLine = new DashLine(g, {
    dash: [3, 3],
  });

  watchEffect(() => {
    g.clear();

    const slider = sliderRef.value;
    if (!slider) return;

    const controlPoints = slider.controlPoints;

    for (let i = 0; i < controlPoints.length - 1; i++) {
      const p1 = controlPoints[i];
      const p2 = controlPoints[i + 1];

      g.lineStyle(1, 0xffffff);
      g.moveTo(p1.position.x, p1.position.y);
      g.lineTo(p2.position.x, p2.position.y);
    }

    g.lineStyle();
  });

  const pointsContainer = new Container();
  const points = [] as SliderHandle[];

  const selectedHandles = reactive(new Set<number>());

  const { mousePos } = useViewport()!;

  function onPathPointMouseDown(
    evt: FederatedPointerEvent,
    handle: SliderHandle,
    index: number
  ) {
    if (evt.button === 0) {
      if (evt.ctrlKey) {
        if (!sliderRef.value) return;
        let type = sliderRef.value.controlPoints[index].type;

        switch (type) {
          case null:
            type = PathType.Bezier;
            break;
          case PathType.Bezier:
            type = PathType.PerfectCurve;
            break;
          case PathType.PerfectCurve:
            type = PathType.Linear;
            break;
          case PathType.Linear:
            type = PathType.Catmull;
            break;
          case PathType.Catmull:
            if (index === 0) type = PathType.Bezier;
            else type = null;
            break;
        }

        sliderRef.value.controlPoints[index].type = type;
        sliderRef.value.controlPoints = sliderRef.value.controlPoints;

        evt.preventDefault();
        return;
      }
      if (evt.shiftKey) {
        if (selectedHandles.has(index)) {
          selectedHandles.delete(index);
        } else {
          selectedHandles.add(index);
        }
      } else if (!selectedHandles.has(index)) {
        selectedHandles.clear();
        selectedHandles.add(index);
      }

      selection.select(sliderRef.value!);

      evt.preventDefault();
      evt.stopImmediatePropagation();

      const slider = sliderRef.value;
      if (!slider) return;

      const positions = slider.controlPoints.map((p) => p.position);
      const startPosition = slider.position;

      const dragStart = mousePos.value;

      beginDrag(mousePos, (evt) => {
        const controlPoints = slider.controlPoints;

        if (selectedHandles.has(0)) {
          const offset = Vec2.sub(evt.pos, dragStart);
          controlPoints[0].position = Vec2.zero();

          for (let i = 0; i < controlPoints.length; i++) {
            if (!selectedHandles.has(i)) {
              controlPoints[i].position = Vec2.round(
                Vec2.sub(positions[i], Vec2.sub(evt.pos, dragStart))
              );
            } else {
              controlPoints[i].position = Vec2.round(positions[i]);
            }
          }
          slider.controlPoints = slider.controlPoints;
          slider.position = Vec2.round(Vec2.add(startPosition, offset));
        } else {
          for (let i = 0; i < controlPoints.length; i++) {
            if (selectedHandles.has(i)) {
              controlPoints[i].position = Vec2.round(
                Vec2.add(positions[i], Vec2.sub(evt.pos, dragStart))
              );
            } else {
              controlPoints[i].position = Vec2.round(positions[i]);
            }
          }

          slider.controlPoints = slider.controlPoints;
          slider.position = startPosition;
        }
      });
    }
  }

  watch(sliderRef, (slider) => {
    if (!slider) selectedHandles.clear();
  });

  watchEffect(() => {
    const controlPoints = sliderRef.value?.controlPoints ?? [];

    if (points.length < controlPoints.length) {
      for (let i = points.length; i < controlPoints.length; i++) {
        const handle = createHandle();
        points.push(handle);
        pointsContainer.addChild(handle.g);

        handle.g.on("pointerdown", (evt) => {
          onPathPointMouseDown(evt, handle, i);
        });
      }
    } else if (points.length > controlPoints.length) {
      for (let i = points.length - 1; i >= controlPoints.length; i--) {
        const handle = points.pop();
        if (handle) pointsContainer.removeChild(handle.g);
        handle?.g.destroy();
      }
    }

    for (let i = 0; i < points.length; i++) {
      const handle = points[i];
      const point = controlPoints[i];
      handle.update(point);
      handle.selected.value = selectedHandles.has(i);
      handle.g.position.copyFrom(point.position);
    }
  });

  watchEffect(() => {
    if (sliderRef.value) root.position.copyFrom(sliderRef.value.position);
  });

  root.addChild(g, pointsContainer);

  return root;
}

export function createHandle() {
  const g = new Graphics();

  g.hitArea = new Circle(0, 0, 7);
  g.eventMode = "static";

  const enterCount = ref(0);
  const radius = ref(3);
  const tint = ref(0xffffff);

  const selected = ref(false);

  g.on("pointerenter", () => enterCount.value++);
  g.on("pointerleave", () => enterCount.value--);

  watchEffect(() => {
    g.clear();

    if (selected.value) {
      g.lineStyle(1, 0xffffff);
    } else {
      g.lineStyle();
    }

    if (enterCount.value > 0) {
      g.beginFill(tint.value);
      g.drawCircle(0, 0, radius.value * 1.25);
      g.endFill();
    } else {
      g.beginFill(tint.value);
      g.drawCircle(0, 0, radius.value);
      g.endFill();
    }
  });

  function update(point: PathPoint) {
    radius.value = point.type !== null ? 4 : 3;
    const type = point.type;

    switch (type) {
      case null:
        tint.value = 0xcccccc;
        break;
      case PathType.Bezier:
        tint.value = 0x00ff00;
        break;
      case PathType.Catmull:
        tint.value = 0xff0000;
        break;
      case PathType.PerfectCurve:
        tint.value = 0x0000ff;
        break;
      case PathType.Linear:
        tint.value = 0xffff00;
        break;
    }
  }

  return { g, update, selected };
}

type SliderHandle = ReturnType<typeof createHandle>;
