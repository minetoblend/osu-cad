<script setup lang="ts">
import {useEditor} from "@/editor/editorContext.ts";
import {SelectTool} from "@/editor/tools/SelectTool.ts";
import {HitCircleTool} from "@/editor/tools/HitCircleTool.ts";
import {SliderTool} from "@/editor/tools/SliderTool.ts";
import {SpinnerTool} from "@/editor/tools/SpinnerTool.ts";
import selectIcon from "@/assets/icons/select.png";
import circleIcon from "@/assets/icons/circle.png";
import sliderIcon from "@/assets/icons/slider.png";
import spinnerIcon from "@/assets/icons/spinner.png";
import {usePreferencesVisible} from "@/composables/usePreferencesVisible.ts";
import {NoArgsConstructor} from "@osucad/common";
import {ComposeTool} from "@/editor/tools/ComposeTool.ts";

const editor = useEditor();
const preferencesVisible = usePreferencesVisible();

const tools = [
  {
    tool: SelectTool,
    icon: selectIcon,
  },
  {
    tool: HitCircleTool,
    icon: circleIcon,
  },
  {
    tool: SliderTool,
    icon: sliderIcon,
  },
  {
    tool: SpinnerTool,
    icon: spinnerIcon,
  }
]

function selectTool(tool: NoArgsConstructor<ComposeTool>) {
  editor.tools.activeTool = new tool();
}

function unfocus(event: FocusEvent) {
  (event.target as HTMLElement).blur();
}

useEventListener("keydown", (evt: KeyboardEvent) => {
  if (editor.tools.activeTool.acceptsNumberKeys) return;
  if (evt.ctrlKey || evt.metaKey || evt.altKey || evt.shiftKey) return;
  switch (evt.key) {
    case "1":
      selectTool(SelectTool);
      break;
    case "2":
      selectTool(HitCircleTool);
      break;
    case "3":
      selectTool(SliderTool);
      break;
    case "4":
      selectTool(SpinnerTool);
      break;
  }
});
</script>

<template>
  <div class="editor-toolbar">
    <button v-for="tool in tools" class="toolbar-button"
            :class="{active: editor.tools.activeTool.constructor === tool.tool}"
            tabindex="-1"
            @pointerdown.left.stop="selectTool(tool.tool)"
            @focus="unfocus"
    >
      <img :src="tool.icon" :alt="tool.tool.name">
    </button>
    <div class="spacer"/>
    <button class="toolbar-button" @click="preferencesVisible = true">
      <img src="@/assets/icons/cogs.png">
    </button>
  </div>
</template>

<style lang="scss">
.editor-toolbar {
  --toolbar-size: 50px;

  width: var(--toolbar-size);
  background-color: $surface-50;
  display: flex;
  flex-direction: column;
  user-select: none;

  .toolbar-button {
    appearance: none;
    width: var(--toolbar-size);
    height: var(--toolbar-size);
    background-color: transparent;
    border: none;
    cursor: pointer;
    color: white;

    img {
      max-width: 85%;
      max-height: 85%;
      object-fit: contain;
    }

    &.active img {
      filter: invert(0.5) sepia(1) saturate(5) hue-rotate(120deg) drop-shadow(2px 2px 4px rgba(white, 0.5));
    }

    &:hover {
      transform: scale(1.05);
      transform-origin: center;
    }
  }

  .spacer {
    flex: 1;
  }
}

body.mobile {
  .editor-toolbar {
    background: none;
    gap: 6px;
    padding: 6px;

    --toolbar-size: 45px;

    .toolbar-button {
      background-color: rgba($surface-50, 0.5);
      border-radius: 6px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
}
</style>