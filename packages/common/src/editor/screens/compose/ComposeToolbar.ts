import type { Key } from 'osucad-framework';
import type { IComposeTool } from './IComposeTool';
import { Axes, dependencyLoader, FillFlowContainer, Vec2 } from 'osucad-framework';
import { ComposeToolButton } from './ComposeToolButton';
import { ToolbarButton } from './ToolbarButton';

export class ComposeToolbar extends FillFlowContainer {
  constructor(readonly tools: IComposeTool[]) {
    super({
      width: ToolbarButton.SIZE,
      autoSizeAxes: Axes.Y,
      spacing: new Vec2(4),
    });
  }

  @dependencyLoader()
  [Symbol('load')]() {
    for (let i = 0; i < this.tools.length; i++) {
      const tool = this.tools[i];

      this.addInternal(new ComposeToolButton(
        tool,
        `Digit${i + 1}` as Key,
      ));
    }
  }
}
