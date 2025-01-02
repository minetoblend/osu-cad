import { OsucadColors, OsucadIcons } from '@osucad/common';
import { Action, Anchor, Container, dependencyLoader, DrawableSprite, EasingFunction, loadTexture, RoundedBox, Vec2 } from 'osucad-framework';
import { AlphaFilter } from 'pixi.js';
import osucadText from '../../assets/textures/osucad-text.png';
import { IntroSlider } from './IntroSlider';

export class HomeScreenIntroSequence extends Container {
  action: (() => void) | null = null;

  constructor() {
    super();

    this.width = 573;
    this.height = 192;
  }

  @dependencyLoader()
  async load() {
    const text = new DrawableSprite({
      texture: await loadTexture(osucadText),
      anchor: Anchor.Center,
      origin: Anchor.Center,
      scale: 0.5,
      x: 75,
      alpha: 0,
    });

    const slider = new IntroSlider().with({
      color: 0x7E7E8F,
    });

    const circle = new RoundedBox({
      anchor: Anchor.Center,
      origin: Anchor.Center,
      position: new Vec2(-102, 30),
      size: 64,
      cornerRadius: 32,
      fillAlpha: 0.5,
      color: 0x7E7E8F,
      outlines: [{
        color: 0xFFFFFF,
        width: 15,
        alignment: 1,
      }],
    });

    const cursor = new DrawableSprite({
      texture: OsucadIcons.get('select@2x'),
      anchor: Anchor.Center,
      origin: Anchor.Center,
      scale: 0.9,
      x: -18,
      y: 19,
      color: OsucadColors.text,
    });

    this.addAllInternal(this.#movementContainer = new Container({
      anchor: Anchor.Center,
      origin: Anchor.Center,
      children: [
        this.#slideContainer = new Container({
          children: [
            slider,
            circle,
            cursor,
          ],
        }),
        text,
      ],
      filters: [this.#alphaFilter],
    }));

    this.addDelay(this.initialDelay, true);

    this.transformTo('containerAlpha', 0.75, 1000);
    slider.transformTo('snakeInProgress', 1, 1000, EasingFunction.OutCubic);

    {
      const sequence = this.beginDelayedSequence(1000, true);
      this.transformTo('containerAlpha', 1);

      this.#slideContainer.moveToX(-129, 1000, EasingFunction.OutExpo);
      circle
        .fadeColor(OsucadColors.primary)
        .fadeColor(0x387562, 100, EasingFunction.OutExpo);
      slider
        .fadeColor(OsucadColors.primary)
        .fadeColor(0x387562, 100, EasingFunction.OutExpo);
      cursor
        .fadeColor(OsucadColors.primaryHighlight)
        .fadeColor(0x63E2B7, 100, EasingFunction.OutExpo);

      text
        .fadeInFromZero(500)
        .moveToX(25)
        .moveToX(75, 1000, EasingFunction.OutExpo);

      sequence.dispose();
    }

    cursor
      .moveToX(70)
      .moveToY(150)
      .moveToX(10, 2500, EasingFunction.OutCubic)
      .moveToY(35, 2500, EasingFunction.OutQuart);

    {
      const sequence = this.beginDelayedSequence(900, true);

      cursor
        .moveToX(-22, 100, EasingFunction.InQuad)
        .moveToY(15, 100, EasingFunction.InQuad)
        .then()
        .moveToX(-18, 1000, EasingFunction.OutExpo)
        .moveToY(19, 1000, EasingFunction.OutExpo);

      sequence.dispose();
    }

    this.#movementContainer.moveToY(100)
      .moveToY(0, 2000, EasingFunction.OutExpo)
      .scaleTo(1.5)
      .scaleTo(1, 2000, EasingFunction.OutExpo);

    this.scheduler.addDelayed(() => this.#finish(), 2500);
  }

  initialDelay = 500;

  #finish() {
    if (this.hasFinished)
      return;
    this.hasFinished = true;
    this.finished.emit();
  }

  hasFinished = false;

  finished = new Action();

  readonly #alphaFilter = new AlphaFilter({
    alpha: 0,
    antialias: 'inherit',
    resolution: devicePixelRatio,
  });

  #movementContainer!: Container;

  #slideContainer!: Container;

  get containerAlpha() {
    return this.#alphaFilter.alpha;
  }

  set containerAlpha(value) {
    this.#alphaFilter.alpha = value;
  }
}
