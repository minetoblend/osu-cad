import { NoArgsConstructor } from '@osucad/common';
import { Bindable, Key } from 'osucad-framework';
import { Texture } from 'pixi.js';
import { ComposeTool } from './tools/ComposeTool';
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
