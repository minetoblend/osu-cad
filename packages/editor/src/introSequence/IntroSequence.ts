import type { ScreenExitEvent } from 'osucad-framework';
import { AudioMixer, OsucadConfigManager, OsucadScreen, OsucadSettings } from '@osucad/common';
import { Anchor, AudioManager, Axes, Box, Container, dependencyLoader, DrawableSprite, EasingFunction, loadTexture, resolved, RoundedBox, Vec2 } from 'osucad-framework';
import { AlphaFilter } from 'pixi.js';
import introDotWav from '../assets/samples/intro.wav';
import osucadText from '../assets/textures/osucad-text.png';
import { ThemeColors } from '../editor/ThemeColors';
import { OsucadIcons } from '../OsucadIcons';
import { IntroSlider } from './IntroSlider';

export class IntroSequence extends OsucadScreen {
  @resolved(ThemeColors)
  colors!: ThemeColors;

  @resolved(OsucadConfigManager)
  config!: OsucadConfigManager;

  @resolved(AudioManager)
  audioManager!: AudioManager;

  @resolved(AudioMixer)
  mixer!: AudioMixer;

  @dependencyLoader()
  async load() {
    if (!this.config.get(OsucadSettings.PlayIntroSequence)) {
      this.schedule(() => this.finish());
      return;
    }

    this.addInternal(
      new Box({
        relativeSizeAxes: Axes.Both,
        color: 0x000000,
      }),
    );

    const sample = await this.audioManager.createSampleFromUrl(this.mixer.userInterface, introDotWav);

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
      color: this.colors.text,
    });

    this.addAllInternal(this.movementContainer = new Container({
      anchor: Anchor.Center,
      origin: Anchor.Center,
      children: [
        this.slideContainer = new Container({
          children: [
            slider,
            circle,
            cursor,
          ],
        }),
        text,
      ],
      filters: [this.alphaFilter],
    }));

    this.addDelay(500, true);

    this.scheduler.addDelayed(() => sample.play(), 510);
    // sample.play();

    this.transformTo('containerAlpha', 0.75, 1000);
    slider.transformTo('snakeInProgress', 1, 1000, EasingFunction.OutCubic);

    {
      using _ = this.beginDelayedSequence(1000, true);
      this.transformTo('containerAlpha', 1);

      this.slideContainer.moveToX(-130, 1000, EasingFunction.OutExpo);
      circle
        .fadeColor(this.colors.primary)
        .fadeColor(0x387562, 100, EasingFunction.OutExpo);
      slider
        .fadeColor(this.colors.primary)
        .fadeColor(0x387562, 100, EasingFunction.OutExpo);
      cursor
        .fadeColor(this.colors.primaryHighlight)
        .fadeColor(0x63E2B7, 100, EasingFunction.OutExpo);

      text
        .fadeInFromZero(500)
        .moveToX(25)
        .moveToX(75, 1000, EasingFunction.OutExpo);
    }

    cursor
      .moveToX(70)
      .moveToY(150)
      .moveToX(10, 2500, EasingFunction.OutCubic)
      .moveToY(35, 2500, EasingFunction.OutQuart);

    {
      using _ = this.beginDelayedSequence(900, true);

      cursor
        .moveToX(-22, 100, EasingFunction.InQuad)
        .moveToY(15, 100, EasingFunction.InQuad)
        .then()
        .moveToX(-18, 1000, EasingFunction.OutExpo)
        .moveToY(19, 1000, EasingFunction.OutExpo);
    }

    this.movementContainer.moveToY(100)
      .moveToY(0, 2000, EasingFunction.OutExpo)
      .scaleTo(1.5)
      .scaleTo(1, 2000, EasingFunction.OutExpo);

    this.scheduler.addDelayed(() => this.finish(), 2500);
  }

  #finished = false;

  #presentOnFinish: OsucadScreen | null = null;

  nextScreenLoaded(nextScreen: OsucadScreen) {
    if (this.#finished)
      this.#presentNextScreen(nextScreen);
    else
      this.#presentOnFinish = nextScreen;
  }

  finish() {
    this.#finished = true;
    if (this.#presentOnFinish)
      this.#presentNextScreen(this.#presentOnFinish);
  }

  #presentNextScreen(screen: OsucadScreen) {
    const screenStack = this.screenStack;
    this.exit();
    screenStack.push(screen);
  }

  onExiting(e: ScreenExitEvent): boolean {
    this.movementContainer?.scaleTo(1.5, 300, EasingFunction.InCubic);
    this.transformTo('containerAlpha', 0, 300);

    return super.onExiting(e);
  }

  alphaFilter = new AlphaFilter({
    alpha: 0,
    antialias: 'inherit',
    resolution: devicePixelRatio,
  });

  movementContainer!: Container;

  slideContainer!: Container;

  get containerAlpha() {
    return this.alphaFilter.alpha;
  }

  set containerAlpha(value) {
    this.alphaFilter.alpha = value;
  }
}
