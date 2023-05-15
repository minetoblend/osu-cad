import { HitObject, Vec2 } from "@osucad/common";
import { MaybeComputedRef, resolveUnref } from "@vueuse/core";
import { computed } from "vue";
import { getToolContext } from "../defineTool";

const SELECTION_FADE_OUT_TIME = 700;

export function useVisibleHitObjects() {
  const ctx = getToolContext();
  return computed(() => {
    const range = ctx.editor.hitObjects.getRange(
      ctx.editor.clock.currentTime - SELECTION_FADE_OUT_TIME,
      ctx.editor.clock.currentTime + ctx.editor.difficulty.timePreempt
    );

    return range;
  });
}

export function useHoveredHitObjects(position: MaybeComputedRef<Vec2>) {
  const ctx = getToolContext();

  const selection = useSelection();

  const visibleHitObjects = computed(() => {
    return ctx.editor.hitObjects.getRange(
      ctx.editor.clock.currentTime - SELECTION_FADE_OUT_TIME,
      ctx.editor.clock.currentTime + ctx.editor.difficulty.timePreempt,
      selection.value
    );
  });

  const radius = 32;

  const hovered = computed(() => {
    const pos = resolveUnref(position);

    const hitObjects = visibleHitObjects.value.filter((o) =>
      o.contains(pos.x, pos.y)
    );

    return hitObjects;
  });

  return {
    hovered,
  };
}

export function getHoveredHitObjects(position: Vec2, hitObjects?: HitObject[]) {
  const ctx = getToolContext();
  if (!hitObjects)
    hitObjects = ctx.editor.hitObjects.getRange(
      ctx.editor.clock.currentTime - ctx.editor.difficulty.timePreempt,
      ctx.editor.clock.currentTime + SELECTION_FADE_OUT_TIME
    );

  const radius = 32;

  return hitObjects.filter(
    (hitObject) => Vec2.distance(position, hitObject.position) < radius
  );
}

export function useSelection() {
  const ctx = getToolContext();

  const { selection } = ctx.editor;

  return selection;
}
