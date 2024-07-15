import type { Texture } from 'pixi.js';
import type {
  InjectionToken,
} from 'osucad-framework';
import {
  Anchor,
  Axes,
  Container,
  RoundedBox,
  resolved,
} from 'osucad-framework';
import type { HitSample, SampleType } from '@osucad/common';
import gsap from 'gsap';
import type { EditorAction } from '../../EditorAction';
import { HitsoundPlayer } from '../../HitsoundPlayer';
import type { ToggleBindable } from './ToggleBindable';
import { ComposeToggleButton } from './ComposeToggleButton';

export class AdditionToggleButton extends ComposeToggleButton {
  constructor(
    icon: Texture,
    key: InjectionToken<ToggleBindable>,
    toggleAction: EditorAction,
    readonly sampleType: SampleType,
  ) {
    super(icon, key, toggleAction);
  }

  @resolved(HitsoundPlayer)
  hitsoundPlayer!: HitsoundPlayer;

  #sampleContainer = new Container({
    relativeSizeAxes: Axes.Both,
  });

  load() {
    this.addInternal(this.#sampleContainer);

    this.withScope(() =>
      this.hitsoundPlayer.samplePlayed.addListener((sample) => {
        this.#onSamplePlayed(sample);
      }),
    );

    super.load();
  }

  #onSamplePlayed(sample: HitSample) {
    if (sample.type !== this.sampleType)
      return;

    const sampleHighlight = new RoundedBox({
      relativeSizeAxes: Axes.Both,
      alpha: 0.2,
      cornerRadius: 5,
      anchor: Anchor.Center,
      origin: Anchor.Center,
    });

    gsap.to(sampleHighlight, {
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: 0.2,
    });

    this.#sampleContainer.add(sampleHighlight);
    sampleHighlight.expire();
  }
}
