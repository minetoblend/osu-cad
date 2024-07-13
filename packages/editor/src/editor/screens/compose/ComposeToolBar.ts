import {
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
import { ToolConstructor } from './ComposeScreen';
import { ComposeToolbarToolButton } from './ComposeToolbarToolButton';
import { HitCircleTool } from './tools/HitCircleTool';
import { SelectTool } from './tools/SelectTool';
import { SliderTool } from './tools/SliderTool';
import { SpinnerTool } from './tools/SpinnerTool';

export class ComposeToolBar extends Container {
  constructor(protected readonly activeTool: Bindable<ToolConstructor>) {
    super({
      relativeSizeAxes: Axes.Y,
      width: 74,
      padding: 10,
    });

    this.addInternal(this.#toolButtons);
  }

  @dependencyLoader()
  init() {
    this.#toolButtons.add(
      new ComposeToolbarToolButton({
        icon: useAsset('icon:select'),
        activeTool: this.activeTool,
        tool: SelectTool,
        keyBinding: Key.Digit1,
      }),
    );
    this.#toolButtons.add(
      new ComposeToolbarToolButton({
        icon: useAsset('icon:circle'),
        activeTool: this.activeTool,
        tool: HitCircleTool,
        keyBinding: Key.Digit2,
      }),
    );
    this.#toolButtons.add(
      new ComposeToolbarToolButton({
        icon: useAsset('icon:slider'),
        activeTool: this.activeTool,
        tool: SliderTool,
        keyBinding: Key.Digit3,
      }),
    );
    this.#toolButtons.add(
      new ComposeToolbarToolButton({
        icon: useAsset('icon:spinner'),
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
