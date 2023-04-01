import {HitObject, Vec2} from "@osucad/common";
import {MaybeComputedRef, resolveUnref} from "@vueuse/core";
import {computed} from "vue";
import {getToolContext} from "../defineTool";

export function useVisibleHitObjects() {
  const ctx = getToolContext();
  const visibleHitObjects = computed(() => {
    const range = ctx.editor.hitObjects.getRange(
      ctx.editor.clock.currentTime - ctx.editor.difficulty.timePreempt,
      ctx.editor.clock.currentTime + 800
    );

    return range;
  });
}

export function useHoveredHitObjects(position: MaybeComputedRef<Vec2>) {
  const ctx = getToolContext();
  const visibleHitObjects = computed(() => {
    const range = ctx.editor.hitObjects.getRange(
      ctx.editor.clock.currentTime - ctx.editor.difficulty.timePreempt,
      ctx.editor.clock.currentTime + 800
    );

    return range;
  });

  const radius = 32;

  const hovered = computed(() => {
    const pos = resolveUnref(position);

    const hitObjects = visibleHitObjects.value.filter(
      (o) => Vec2.distance(pos, o.position) < radius
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
      ctx.editor.clock.currentTime - 1000,
      ctx.editor.clock.currentTime + 1000
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
