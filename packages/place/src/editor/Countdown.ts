import type { DrawableOptions } from '@osucad/framework';
import type { Graphics } from 'pixi.js';
import { OsucadColors, OsucadSpriteText } from '@osucad/core';
import { Anchor, Axes, Box, CircularContainer, CompositeDrawable, Container, EasingFunction, GraphicsDrawable, Vec2 } from '@osucad/framework';
import { Color, Texture } from 'pixi.js';
import { CountdownShader } from './CountdownShader';

export class Countdown extends CompositeDrawable {
  constructor() {
    super();

    this.size = new Vec2(64);

    this.internalChildren = [
      this.#ringFill2 = new Container({
        relativeSizeAxes: Axes.Both,
        masking: true,
        cornerRadius: 4,
        anchor: Anchor.Center,
        origin: Anchor.Center,
        alpha: 0.6,
        color: 0x222228,
        size: 1.15,
        child: new Box({
          relativeSizeAxes: Axes.Both,
        }),
      }),

      this.#ringFill3 = new Container({
        relativeSizeAxes: Axes.Both,
        masking: true,
        cornerRadius: 4,
        anchor: Anchor.Center,
        origin: Anchor.Center,
        color: 0x222228,
        alpha: 0.4,
        size: 1.3,
        child: new Box({
          relativeSizeAxes: Axes.Both,
        }),
      }),
      this.#ring = new CircularContainer({
        relativeSizeAxes: Axes.Both,
        anchor: Anchor.Center,
        origin: Anchor.Center,
        children: [

          this.#innerRing = new Container({
            relativeSizeAxes: Axes.Both,
            anchor: Anchor.Center,
            origin: Anchor.Center,
            children: [
              this.#ringFill = new Container({
                relativeSizeAxes: Axes.Both,
                masking: true,
                cornerRadius: 4,
                anchor: Anchor.Center,
                origin: Anchor.Center,
                color: 0x222228,
                child: new Box({
                  relativeSizeAxes: Axes.Both,
                }),
              }),
              this.#ring = new Container({
                relativeSizeAxes: Axes.Both,
                masking: true,
                cornerRadius: 4,
                anchor: Anchor.Center,
                origin: Anchor.Center,
                borderColor: new Color(0x000000).setAlpha(0.2),
                borderThickness: 4,
                size: 0.87,
                child: new Box({
                  relativeSizeAxes: Axes.Both,
                  alpha: 0,
                  alwaysPresent: true,
                }),
              }),
              this.#arc = new CountdownProgressBar({
                relativeSizeAxes: Axes.Both,
                color: OsucadColors.primaryHighlight,
                scale: 3.0,
                anchor: Anchor.Center,
                origin: Anchor.Center,
                blendMode: 'add',
                alpha: 1.0,
              }),
            ],
          }),

          this.#spriteText = new OsucadSpriteText({
            text: '1:00',
            anchor: Anchor.Center,
            origin: Anchor.Center,
            fontWeight: 700,
          }),
        ],
      }),

    ];
  }

  endTime = 0;
  #ring: CircularContainer;
  #innerRing: Container;
  #ringFill: Container;
  #ringFill2: Container;
  #ringFill3: Container;
  #remainingSeconds = 0;
  #spriteText: OsucadSpriteText;
  #arc: CountdownProgressBar;

  protected loadComplete() {
    super.loadComplete();

    this.endTime = this.time.current + 16_000;
    this.#updateProgress(this.time.current + 1000);
    this.finishTransforms(true);
    this.#updateProgress();
  }

  update() {
    super.update();

    this.#updateProgress();
  }

  #updateProgress(time: number = this.time.current) {
    const remainingSeconds = Math.max(Math.ceil((this.endTime - time) / 1000), 0);

    if (remainingSeconds !== this.#remainingSeconds) {
      this.#remainingSeconds = remainingSeconds;

      this.#ring
        .scaleTo(0.95, 50, EasingFunction.OutExpo)
        .then()
        .scaleTo(1, 900, EasingFunction.OutElastic);

      if (remainingSeconds === 0) {
        this.#arc.transformTo('progress', 1, 500, EasingFunction.OutExpo);

        this.#spriteText.text = '0:00';

        this.#innerRing.rotateTo(Math.PI * 0.25, 2000, EasingFunction.OutElasticHalf);
        this.#ringFill2.rotateTo(Math.PI * 0.25, 2200, EasingFunction.OutElastic);
        this.#ringFill3.rotateTo(Math.PI * 0.25, 2400, EasingFunction.OutElastic);

        return;
      }

      this.#innerRing.rotateTo((remainingSeconds + 1) * -0.5, 2000, EasingFunction.OutQuart);
      this.#ringFill2.rotateTo((remainingSeconds + 2) * 0.4, 2000, EasingFunction.OutQuart);
      this.#ringFill3.rotateTo((remainingSeconds + 3) * -0.25, 2000, EasingFunction.OutQuart);

      const minutes = Math.floor(remainingSeconds / 60);
      const seconds = Math.floor(remainingSeconds % 60);

      this.#spriteText.text = [
        minutes,
        seconds >= 10 ? seconds : `0${seconds}`,
      ].join(':');

      this.#ringFill2
        .scaleTo(1.02, 100, EasingFunction.OutExpo)
        .then()
        .scaleTo(1, 900, EasingFunction.OutElastic);

      this.#ringFill3
        .scaleTo(1.02, 100, EasingFunction.OutExpo)
        .then()
        .scaleTo(1, 900, EasingFunction.OutElastic);

      this.#ringFill.fadeColor(0x444448, 100, EasingFunction.OutExpo)
        .then()
        .fadeColor(0x222228, 900);

      this.#arc
        .transformTo('progress', remainingSeconds / 20, 300, EasingFunction.OutExpo);
    }
  }
}

class CountdownProgressBar extends GraphicsDrawable {
  constructor(options: DrawableOptions = {}) {
    super();

    this.with(options);

    this.#shader = (this.drawNode as Graphics).context.customShader = new CountdownShader();
  }

  readonly #shader: CountdownShader;

  #progress = 0.32;

  get progress() {
    return this.#progress;
  }

  set progress(value) {
    this.#progress = value;
    this.#shader.progress = value;
  }

  updateGraphics(g: Graphics) {
    g.clear().texture(Texture.WHITE, 0xFFFFFF, 0, 0, this.drawWidth, this.drawHeight);
  }
}
