import type { Ref } from "./vue";
import { customRef, onScopeDispose } from "./vue";
import type { Bindable } from "../bindables";

export function toRef<T>(bindable: Bindable<T>): Ref<T>
{
  return customRef((track, trigger) =>
  {
    bindable.valueChanged.addListener(trigger);

    onScopeDispose(() => bindable.valueChanged.removeListener(trigger), true);

    return {
      get()
      {
        track();
        return bindable.value;
      },
      set(value)
      {
        bindable.value = value;
      },
    };
  });
}
