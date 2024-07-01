import {
  Anchor,
  Axes,
  Bindable,
  Container,
  FillDirection,
  FillFlowContainer,
  Key,
  Vec2,
  dependencyLoader,
  resolved,
} from 'osucad-framework';
import { ComposeToolbarButton } from './ComposeToolbarButton';
import { UIIcons } from '../../UIIcons';
import { NoArgsConstructor } from '@osucad/common';
import { ComposeTool } from './tools/ComposeTool';
import { ComposeToolbarToolButton } from './ComposeToolbarToolButton';
import { SelectTool } from './tools/SelectTool';
import { HitCircleTool } from './tools/HitCircleTool';
import { SliderTool } from './tools/SliderTool';
import { SpinnerTool } from './tools/SpinnerTool';

export class ComposeToolbar extends Container {
  constructor(readonly activeTool: Bindable<NoArgsConstructor<ComposeTool>>) {
    super({
      width: 54,
      relativeSizeAxes: Axes.Y,
      margin: 10,
    });

    this.addInternal(this.#toolButtons);
  }

  @resolved(UIIcons)
  icons!: UIIcons;

  @dependencyLoader()
  init() {
    this.#toolButtons.add(
      new ComposeToolbarToolButton({
        icon: this.icons.select,
        activeTool: this.activeTool,
        tool: SelectTool,
        keyBinding: Key.Digit1,
      }),
    );
    this.#toolButtons.add(
      new ComposeToolbarToolButton({
        icon: this.icons.circle,
        activeTool: this.activeTool,
        tool: HitCircleTool,
        keyBinding: Key.Digit2,
      }),
    );
    this.#toolButtons.add(
      new ComposeToolbarToolButton({
        icon: this.icons.slider,
        activeTool: this.activeTool,
        tool: SliderTool,
        keyBinding: Key.Digit3,
      }),
    );
    this.#toolButtons.add(
      new ComposeToolbarToolButton({
        icon: this.icons.spinner,
        activeTool: this.activeTool,
        tool: SpinnerTool,
        keyBinding: Key.Digit4,
      }),
    );
  }

  override get content() {
    return this.#toolButtons;
  }

  #toolButtons = new FillFlowContainer({
    relativeSizeAxes: Axes.Both,
    direction: FillDirection.Vertical,
    spacing: new Vec2(6),
  });

  #toggleButtons = new FillFlowContainer({
    relativeSizeAxes: Axes.Both,
    direction: FillDirection.Vertical,
    spacing: new Vec2(6),
  });
}
