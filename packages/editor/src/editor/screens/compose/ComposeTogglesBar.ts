import {
  Anchor,
  Axes,
  Container,
  FillDirection,
  FillFlowContainer,
  RoundedBox,
  Vec2,
  dependencyLoader,
  resolved,
} from 'osucad-framework';
import { UIIcons } from '../../UIIcons';
import { NewComboButton } from './tools/NewComboButton';
import { ComposeAdditionButton } from './ComposeAdditionButton';
import { ThemeColors } from '../../ThemeColors';

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

  @resolved(ThemeColors)
  colors!: ThemeColors;

  @dependencyLoader()
  init() {
    this.addAll(
      new NewComboButton(this.icons.newCombo),
      new Container({
        relativeSizeAxes: Axes.X,
        height: 12,
        padding: { horizontal: 12 },
        child: new RoundedBox({
          relativeSizeAxes: Axes.X,
          height: 1.5,
          anchor: Anchor.Center,
          origin: Anchor.Center,
          color: 'white',
          alpha: 0.2,
          cornerRadius: 1,
        }),
      }),
      new ComposeAdditionButton(this.icons.whistle),
      new ComposeAdditionButton(this.icons.finish),
    );
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
