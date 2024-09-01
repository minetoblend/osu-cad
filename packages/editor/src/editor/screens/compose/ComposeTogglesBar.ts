import {
  Anchor,
  Axes,
  Container,
  FillDirection,
  FillFlowContainer,
  Vec2,
  dependencyLoader,
  resolved,
} from 'osucad-framework';
import { EditorAction } from '../../EditorAction';

import { ThemeColors } from '../../ThemeColors';
import { OsucadIcons } from '../../../OsucadIcons';
import { Additions } from '../../../beatmap/hitSounds/Additions';
import { FastRoundedBox } from '../../../drawables/FastRoundedBox';
import { AdditionToggleButton } from './AdditionToggleButton';
import { ComposeToolbarButton } from './ComposeToolbarButton';
import { ComposeComboToggleButton } from './ComposeComboToggleButton';

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
