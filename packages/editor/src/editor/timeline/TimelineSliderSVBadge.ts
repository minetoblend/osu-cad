import type {
  MouseDownEvent,
} from 'osucad-framework';
import {
  Anchor,
  Axes,
  CompositeDrawable,
  MouseButton,
  dependencyLoader,
  resolved,
} from 'osucad-framework';
import type { SerializedSlider, Slider } from '@osucad/common';
import { UpdateHitObjectCommand } from '@osucad/common';
import { FastRoundedBox } from '../../drawables/FastRoundedBox';
import { OsucadSpriteText } from '../../OsucadSpriteText';
import { CommandManager } from '../context/CommandManager';

export class TimelineSliderSVBadge extends CompositeDrawable {
  constructor(readonly slider: Slider) {
    super();

    this.origin = Anchor.BottomLeft;
    this.y = -1;
  }

  @dependencyLoader()
  load() {
    this.slider.onUpdate.addListener((type) => {
      if (type === 'velocity') {
        this.setup();
      }
    });

    this.autoSizeAxes = Axes.Both;

    this.addAllInternal(
      new FastRoundedBox({
        relativeSizeAxes: Axes.Both,
        color: 0x222228,
        alpha: 0.75,
        cornerRadius: 2,
      }),
      this.#text = new OsucadSpriteText({
        text: 'SV: 1.0',
        fontSize: 10,
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

      this.#text.text = `SV ${this.slider.velocityOverride.toFixed(2)}`;
    }
  }

  @resolved(CommandManager)
  commandManager!: CommandManager;

  onMouseDown(e: MouseDownEvent): boolean {
    if (e.button === MouseButton.Right) {
      this.commandManager.submit(
        new UpdateHitObjectCommand(this.slider, {
          velocity: null,
        } as Partial<SerializedSlider>),
      );

      return true;
    }

    return false;
  }
}
