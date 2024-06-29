import {
  Axes,
  Container,
  FillDirection,
  FillFlowContainer,
  Vec2,
  dependencyLoader,
  resolved,
} from 'osucad-framework';
import { ComposeToolbarButton } from './ComposeToolbarButton';
import { UIIcons } from '../../UIIcons';

export class ComposeToolbar extends Container {
  constructor() {
    super({
      width: 48,
      relativeSizeAxes: Axes.Y,
      margin: 10,
    });

    this.addInternal(this.#content);
  }

  @resolved(UIIcons)
  icons!: UIIcons;

  @dependencyLoader()
  init() {
    this.add(new ComposeToolbarButton(this.icons.circle));
    this.add(new ComposeToolbarButton(this.icons.slider));
    this.add(new ComposeToolbarButton(this.icons.spinner));
  }

  override get content() {
    return this.#content;
  }

  #content = new FillFlowContainer({
    relativeSizeAxes: Axes.Both,
    direction: FillDirection.Vertical,
    spacing: new Vec2(4),
  });
}
