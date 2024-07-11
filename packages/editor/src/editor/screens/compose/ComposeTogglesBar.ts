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
import { EditorAction } from '../../EditorAction';
import {
  NEW_COMBO,
  SAMPLE_CLAP,
  SAMPLE_FINISH,
  SAMPLE_WHISTLE,
} from '../../InjectionTokens';
import { ThemeColors } from '../../ThemeColors';
import { UIIcons } from '../../UIIcons';
import { ComposeToggleButton } from './ComposeToggleButton';

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
      new ComposeToggleButton(
        this.icons.newCombo,
        NEW_COMBO,
        EditorAction.ToggleNewCombo,
      ),
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
      new ComposeToggleButton(this.icons.whistle, SAMPLE_WHISTLE),
      new ComposeToggleButton(this.icons.finish, SAMPLE_FINISH),
      new ComposeToggleButton(this.icons.clap, SAMPLE_CLAP),
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
