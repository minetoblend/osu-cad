import { onKeyStroke } from "@vueuse/core";
import { computed } from "vue";
import { ref } from "vue";
import * as math from "mathjs";

export function useNumberValue(isInt?: boolean, exclude?: string[]) {
  const stringValue = ref("");

  onKeyStroke((e) => {
    if (e.key === "Backspace") {
      stringValue.value = stringValue.value.slice(0, -1);
      e.preventDefault();
      e.stopImmediatePropagation();
    } else if (e.key.length === 1 && !exclude?.includes(e.key)) {
      e.preventDefault();
      e.stopImmediatePropagation();
      stringValue.value += e.key;
    }
  });

  const value = computed(() => {
    if (stringValue.value === "") return undefined;

    if (stringValue.value === "-") return 0;

    try {
      const value = math.evaluate(stringValue.value);
      
      if (isNaN(value)) return undefined;

      if (isInt) return Math.round(value);

      return value;
    } catch (e) {
      return undefined;
    }
  });

  return { value, stringValue };
}
