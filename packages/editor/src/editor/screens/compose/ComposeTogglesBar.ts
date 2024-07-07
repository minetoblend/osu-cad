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
  Anchor,
} from 'osucad-framework';
import { UIIcons } from '../../UIIcons';
import { ToolConstructor } from './ComposeScreen';
import { ComposeToolbarToolButton } from './ComposeToolbarToolButton';
import { HitCircleTool } from './tools/HitCircleTool';
import { SelectTool } from './tools/SelectTool';
import { SliderTool } from './tools/SliderTool';
import { SpinnerTool } from './tools/SpinnerTool';
import { ComposeToolbarButton } from './ComposeToolbarButton';
import { NewComboButton } from './tools/NewComboButton';

export class ComposeTogglesBar extends Container {
  constructor() {
    super({
      relativeSizeAxes: Axes.Y,
      width: 74,
      padding: 10,
      anchor: Anchor.TopRight,
      origin: Anchor.TopRight,
    });

    this.addInternal(this.#toggleButtons);
  }

  @resolved(UIIcons)
  icons!: UIIcons;

  @dependencyLoader()
  init() {
    this.add(new NewComboButton(this.icons.newCombo));
  }

  override get content() {
    return this.#toggleButtons;
  }

  #toggleButtons = new FillFlowContainer({
    relativeSizeAxes: Axes.Both,
    direction: FillDirection.Vertical,
    spacing: new Vec2(6),
  });
}
