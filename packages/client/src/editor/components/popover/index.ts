import { createGlobalState } from '@vueuse/core';
import { IVec2 } from '@osucad/common';
import { Component, markRaw, ref, watch } from 'vue';
import { v4 as uuid } from 'uuid';

export { default as EditorPopoverHost } from './EditorPopoverHost.vue';

export interface PopoverData {
  id: string;
  position: IVec2;
  component: Component;
  visible: boolean;
  props: Record<string, unknown>;
  anchor: `${'top' | 'bottom'} ${'left' | 'right'}`;
}

export interface ShowPopoverOptions {
  position: IVec2;
  component: Component;
  props: Record<string, unknown>;
  anchor?: `${'top' | 'bottom'} ${'left' | 'right'}`;
}

export const usePixiPopover = createGlobalState(() => {
  const currentPopover = ref<PopoverData>();

  const showPopover = (options: ShowPopoverOptions) => {
    const { position, component, props, anchor = 'bottom right' } = options;

    const popover: PopoverData = {
      id: uuid(),
      position,
      component: markRaw(component),
      visible: true,
      props,
      anchor,
    };

    currentPopover.value = popover;
    return popover;
  };

  const hidePopover = () => {
    currentPopover.value = undefined;
  };

  watch(currentPopover, (value, oldValue) => {
    if (value && oldValue) {
      if (value.id !== oldValue.id) {
        oldValue.visible = false;
      }
    }
  });

  return {
    currentPopover,
    showPopover,
    hidePopover,
  };
});
