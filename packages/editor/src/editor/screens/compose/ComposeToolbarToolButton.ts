import { NoArgsConstructor } from '@osucad/common';
import { Bindable } from 'osucad-framework';
import { Texture } from 'pixi.js';
import { ComposeTool } from './tools/ComposeTool';
import { ComposeToolbarButton } from './ComposeToolbarButton';

export class ComposeToolbarToolButton extends ComposeToolbarButton {
  constructor(
    icon: Texture,
    readonly activeTool: Bindable<NoArgsConstructor<ComposeTool>>,
    readonly tool: NoArgsConstructor<ComposeTool>,
  ) {
    super(icon);

    this.action = () => {
      this.activeTool.value = this.tool;
    };
  }

  init() {
    super.init();

    this.activeTool.addOnChangeListener(
      (tool) => {
        this.active = tool === this.tool;
      },
      { immediate: true },
    );
  }
}
