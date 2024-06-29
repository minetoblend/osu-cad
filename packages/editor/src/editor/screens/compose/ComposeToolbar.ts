import {
  Anchor,
  Axes,
  Bindable,
  Container,
  FillDirection,
  FillFlowContainer,
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
      new ComposeToolbarToolButton(
        this.icons.select,
        this.activeTool,
        SelectTool,
      ),
    );
    this.#toolButtons.add(
      new ComposeToolbarToolButton(
        this.icons.circle,
        this.activeTool,
        HitCircleTool,
      ),
    );
    this.#toolButtons.add(
      new ComposeToolbarToolButton(
        this.icons.slider,
        this.activeTool,
        SliderTool,
      ),
    );
    this.#toolButtons.add(
      new ComposeToolbarToolButton(
        this.icons.spinner,
        this.activeTool,
        SpinnerTool,
      ),
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
