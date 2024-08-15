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
import { SampleType } from '@osucad/common';
import { EditorAction } from '../../EditorAction';
import {
  NEW_COMBO,
  SAMPLE_CLAP,
  SAMPLE_FINISH,
  SAMPLE_WHISTLE,
} from '../../InjectionTokens';
import { ThemeColors } from '../../ThemeColors';
import { ComposeToggleButton } from './ComposeToggleButton';
import { AdditionToggleButton } from './AdditionToggleButton';
import { ComposeToolbarButton } from './ComposeToolbarButton';

export class ComposeTogglesBar extends Container {
  constructor() {
    super({
      relativeSizeAxes: Axes.Y,
      width: ComposeToolbarButton.SIZE + 20,
      padding: 10,
      anchor: Anchor.TopRight,
      origin: Anchor.TopRight,
    });

    this.drawNode.enableRenderGroup();

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
      new AdditionToggleButton(
        useAsset('icon:whistle@2x'),
        SAMPLE_WHISTLE,
        EditorAction.ToggleWhistle,
        SampleType.Whistle,
      ),
      new AdditionToggleButton(
        useAsset('icon:finish@2x'),
        SAMPLE_FINISH,
        EditorAction.ToggleFinish,
        SampleType.Finish,
      ),
      new AdditionToggleButton(
        useAsset('icon:clap@2x'),
        SAMPLE_CLAP,
        EditorAction.ToggleClap,
        SampleType.Clap,
      ),
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
