import type { NoArgsConstructor } from '@osucad/common';
import type { Bindable, Key } from 'osucad-framework';
import type { Texture } from 'pixi.js';
import type { ComposeTool } from './tools/ComposeTool';
import { ComposeToolbarButton } from './ComposeToolbarButton';

export interface ComposeToolbarToolButtonOptions {
  icon: Texture;
  activeTool: Bindable<NoArgsConstructor<ComposeTool>>;
  tool: NoArgsConstructor<ComposeTool>;
  keyBinding?: Key;
}

export class ComposeToolbarToolButton extends ComposeToolbarButton {
  constructor(options: ComposeToolbarToolButtonOptions) {
    super(options.icon, options.keyBinding);

    this.activeTool = options.activeTool;
    this.tool = options.tool;

    this.action = () => {
      this.activeTool.value = this.tool;
    };
  }

  readonly activeTool: Bindable<NoArgsConstructor<ComposeTool>>;
  readonly tool: NoArgsConstructor<ComposeTool>;

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
