import {MaybeComputedRef, resolveUnref} from "@vueuse/core";
import {Container} from "pixi.js";
import {ref, watchEffect} from "vue";

export function createConstantSizeContainer(
  targetWidth: number,
  targetHeight: number,
  actualWidth: MaybeComputedRef<number>,
  actualHeight: MaybeComputedRef<number>,
  padding: number = 0
) {
  const size = ref(1);
  const x = ref(0);
  const y = ref(0);

  const container = new Container();

  watchEffect(() => {
    const actualWidthValue = resolveUnref(actualWidth);
    const actualHeightValue = resolveUnref(actualHeight);

    const widthRatio = actualWidthValue / (targetWidth + padding * 2);
    const heightRatio = actualHeightValue / (targetHeight + padding * 2);

    const ratio = Math.min(widthRatio, heightRatio);

    size.value = ratio;

    x.value = (actualWidthValue - targetWidth * ratio) / 2;
    y.value = (actualHeightValue - targetHeight * ratio) / 2;

    container.scale.set(ratio);
    container.position.set(x.value, y.value);

  });

  return { container, size, x, y };
}
