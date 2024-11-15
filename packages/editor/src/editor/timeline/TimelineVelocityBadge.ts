import type { Slider } from '@osucad/common';
import type { HoverEvent, MouseDownEvent } from 'osucad-framework';
import { UpdateHitObjectCommand } from '@osucad/common';
import { Anchor, Axes, CompositeDrawable, Container, dependencyLoader, MouseButton, resolved } from 'osucad-framework';
import { FastRoundedBox } from '../../drawables/FastRoundedBox';
import { OsucadSpriteText } from '../../OsucadSpriteText';
import { CommandManager } from '../context/CommandManager';

export class TimelineVelocityBadge extends CompositeDrawable {
  constructor(readonly slider: Slider) {
    super();

    this.origin = Anchor.BottomLeft;
    this.y = -2;
  }

  @dependencyLoader()
  load() {
    this.slider.velocityBindable.valueChanged.addListener(this.setup, this);

    this.autoSizeAxes = Axes.Both;

    this.addAllInternal(
      new FastRoundedBox({
        relativeSizeAxes: Axes.Both,
        color: 0x222228,
        alpha: 0.75,
        cornerRadius: 3,
      }),
      new Container({
        autoSizeAxes: Axes.Both,
        padding: { horizontal: 4, vertical: 2 },
        child: this.#text = new OsucadSpriteText({
          text: 'SV: 1.0',
          fontSize: 10,
        }),
      }),
    );

    this.setup();
  }

  #text!: OsucadSpriteText;

  setup() {
    if (this.slider.velocityOverride === null) {
      this.hide();
    }
    else {
      this.show();

      const rounded = Math.round(this.slider.velocityOverride * 100) / 100;

      this.#text.text = `SV ${rounded.toFixed(2)}`;
    }
  }

  @resolved(CommandManager)
  commandManager!: CommandManager;

  onMouseDown(e: MouseDownEvent): boolean {
    if (e.button === MouseButton.Right) {
      this.commandManager.submit(
        new UpdateHitObjectCommand(this.slider, {
          velocityOverride: null,
        }),
      );

      return true;
    }

    return false;
  }

  onHover(e: HoverEvent): boolean {
    return true;
  }
}
