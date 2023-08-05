import {MaybeComputedElementRef, useEventListener} from "@vueuse/core";
import {useEditor} from "@/editor/createEditor";

export function seekOnScroll(el: MaybeComputedElementRef<HTMLElement>) {
  const { clock, container } = useEditor()!;

  const timing = container.document.objects.timing;

  useEventListener(el, "wheel", (evt: WheelEvent) => {
    if (evt.shiftKey || evt.altKey || evt.metaKey) return;
    evt.preventDefault();

    const beatDuration =
      timing.getTimingPointAt(clock.currentTime)?.beatDuration ?? 500; // 120 bpm

    const divisor = 4;

    let deltaT = (Math.sign(evt.deltaY) * beatDuration) / divisor;

    if (evt.ctrlKey || clock.isPlaying) deltaT *= 4;



    const newTime = timing.snapTime(clock.currentTime + deltaT, divisor);

    clock.seek(newTime);
  });
}
