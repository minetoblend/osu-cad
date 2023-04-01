import {MaybeComputedElementRef, unrefElement, useEventListener} from "@vueuse/core";
import {ref} from "vue";

export function useInputSelection(
  input: MaybeComputedElementRef<HTMLInputElement | undefined>
) {
  const start = ref<number>();
  const end = ref<number>();

  const updateSelection = () => {
    requestAnimationFrame(() => {
      const el = unrefElement(input);
      if (!el || document.activeElement !== el) {
        start.value = undefined;
        end.value = undefined;
        return;
      }

      const { selectionStart, selectionEnd } = el;
      if (selectionStart === null || selectionEnd === null) return;

      start.value = selectionStart;
      end.value = selectionEnd;
    });
  };

  useEventListener(input, "focus", updateSelection);
  useEventListener(input, "blur", updateSelection);
  useEventListener(input, "input", updateSelection);
  useEventListener(input, "pointerdown", updateSelection);
  useEventListener(input, "keydown", updateSelection);
  useEventListener(input, "mousemove", updateSelection);


  return { start, end };
}

export interface ISelectionRange {
  start: number;
  end: number;
}
