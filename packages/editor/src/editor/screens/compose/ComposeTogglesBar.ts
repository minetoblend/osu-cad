import { Additions } from '@osucad/common';
import { Anchor, Axes, Container, dependencyLoader, FastRoundedBox, FillDirection, FillFlowContainer, resolved, Vec2 } from 'osucad-framework';
import { OsucadIcons } from '../../../OsucadIcons';
import { EditorAction } from '../../EditorAction';
import { ThemeColors } from '../../ThemeColors';
import { AdditionToggleButton } from './AdditionToggleButton';
import { ComposeComboToggleButton } from './ComposeComboToggleButton';
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

    this.childrenWillGoOutOfBounds = false;

    this.addInternal(this.#content = new FillFlowContainer({
      relativeSizeAxes: Axes.Both,
      direction: FillDirection.Vertical,
      spacing: new Vec2(6),
    }));
  }

  @resolved(ThemeColors)
  colors!: ThemeColors;

  @dependencyLoader()
  init() {
    this.addAll(
      new ComposeComboToggleButton(),
      new Separator(),
      new AdditionToggleButton(
        OsucadIcons.get('whistle@2x'),
        Additions.Whistle,
        EditorAction.ToggleWhistle,
      ),
      new AdditionToggleButton(
        OsucadIcons.get('finish@2x'),
        Additions.Finish,
        EditorAction.ToggleFinish,
      ),
      new AdditionToggleButton(
        OsucadIcons.get('clap@2x'),
        Additions.Clap,
        EditorAction.ToggleClap,
      ),
    );
  }

  override get content() {
    return this.#content;
  }

  readonly #content: FillFlowContainer;
}

class Separator extends Container {
  constructor() {
    super({
      relativeSizeAxes: Axes.X,
      height: 12,
      padding: { horizontal: 12 },
      child: new FastRoundedBox({
        relativeSizeAxes: Axes.X,
        height: 1.5,
        anchor: Anchor.Center,
        origin: Anchor.Center,
        color: 'white',
        alpha: 0.2,
        cornerRadius: 1,
      }),
    });
  }
}
