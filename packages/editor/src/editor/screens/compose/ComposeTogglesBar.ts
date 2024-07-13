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

  @resolved(ThemeColors)
  colors!: ThemeColors;

  @dependencyLoader()
  init() {
    this.addAll(
      new ComposeToggleButton(
        useAsset('icon:new-combo'),
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
      new ComposeToggleButton(
        useAsset('icon:whistle@2x'),
        SAMPLE_WHISTLE,
        EditorAction.ToggleWhistle,
      ),
      new ComposeToggleButton(
        useAsset('icon:finish@2x'),
        SAMPLE_FINISH,
        EditorAction.ToggleFinish,
      ),
      new ComposeToggleButton(
        useAsset('icon:clap@2x'),
        SAMPLE_CLAP,
        EditorAction.ToggleClap,
      ),
    );

    this.addInternal(
      new Container({
        autoSizeAxes: Axes.Both,
        anchor: Anchor.BottomRight,
        origin: Anchor.BottomRight,
      }),
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
