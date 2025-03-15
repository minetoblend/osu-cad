import type { DrawableOptions } from '@osucad/framework';
import type { Graphics } from 'pixi.js';
import { OsucadColors, OsucadSpriteText } from '@osucad/core';
import { Anchor, Axes, BindableBoolean, Box, CircularContainer, CompositeDrawable, Container, EasingFunction, GraphicsDrawable, Vec2 } from '@osucad/framework';
import { Color, Texture } from 'pixi.js';
import { CountdownShader } from './CountdownShader';

export class Countdown extends CompositeDrawable {
  constructor() {
    super();

    this.size = new Vec2(96);
    this.padding = 16;

    this.alwaysPresent = true;

    this.internalChildren = [
      this.#middlePiece = new Container({
        relativeSizeAxes: Axes.Both,
        masking: true,
        cornerRadius: 4,
        anchor: Anchor.Center,
        origin: Anchor.Center,
        alpha: 0.6,
        color: 0x222228,
        size: 1.15,
        rotation: Math.PI * 0.25,
        child: new Box({
          relativeSizeAxes: Axes.Both,
        }),
      }),

      this.#outerPiece = new Container({
        relativeSizeAxes: Axes.Both,
        masking: true,
        cornerRadius: 4,
        anchor: Anchor.Center,
        origin: Anchor.Center,
        color: 0x222228,
        alpha: 0.4,
        size: 1.3,
        rotation: Math.PI * 0.25,
        child: new Box({
          relativeSizeAxes: Axes.Both,
        }),
      }),
      this.#ring = new CircularContainer({
        relativeSizeAxes: Axes.Both,
        anchor: Anchor.Center,
        origin: Anchor.Center,
        children: [

          this.#innerPiece = new Container({
            relativeSizeAxes: Axes.Both,
            anchor: Anchor.Center,
            origin: Anchor.Center,
            rotation: Math.PI * 0.25,
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
            text: '0:00',
            anchor: Anchor.Center,
            origin: Anchor.Center,
            fontWeight: 700,
          }),
        ],
      }),

    ];
  }

  endTime = 0;
  totalDuration = 0;

  #ring: CircularContainer;
  #innerPiece: Container;
  #ringFill: Container;
  #middlePiece: Container;
  #outerPiece: Container;
  #remainingSeconds?: number;
  #spriteText: OsucadSpriteText;
  #arc: CountdownProgressBar;

  readonly isRunning = new BindableBoolean();

  start(endTime: number, totalDuration: number = endTime - this.time.current) {
    if (endTime <= this.time.current)
      return;

    this.endTime = endTime;
    this.totalDuration = Math.max(Math.ceil(totalDuration / 1000), 1);

    const rotations = [
      this.#innerPiece.rotation,
      this.#middlePiece.rotation,
      this.#outerPiece.rotation,
    ].map(rot => (rot + Math.PI) % Math.PI - Math.PI);

    this.#updateProgress(this.time.current - 1000);
    this.finishTransforms(true);

    this.#innerPiece.rotation = Math.floor(this.#innerPiece.rotation / (Math.PI * 2)) * Math.PI * 2 + (rotations[0]);
    this.#middlePiece.rotation = Math.ceil(this.#middlePiece.rotation / (Math.PI * 2)) * Math.PI * 2 + (rotations[1]);
    this.#outerPiece.rotation = Math.floor(this.#outerPiece.rotation / (Math.PI * 2)) * Math.PI * 2 + (rotations[2]);

    this.#updateProgress();

    this.isRunning.value = true;
  }

  update() {
    super.update();

    if (this.time.elapsed > 1000) {
      this.#updateProgress(this.time.current - 1000);
      this.finishTransforms(true);
    }

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

        this.#innerPiece.rotateTo(Math.PI * 0.25, 2000, EasingFunction.OutElasticHalf);
        this.#middlePiece.rotateTo(Math.PI * 0.25, 2200, EasingFunction.OutElastic);
        this.#outerPiece.rotateTo(Math.PI * 0.25, 2400, EasingFunction.OutElastic);

        this.schedule(() => this.isRunning.value = false);

        return;
      }

      this.#innerPiece.rotateTo((remainingSeconds + 1) * -0.5, 2000, EasingFunction.OutQuart);
      this.#middlePiece.rotateTo((remainingSeconds + 2) * 0.4, 2000, EasingFunction.OutQuart);
      this.#outerPiece.rotateTo((remainingSeconds + 3) * -0.25, 2000, EasingFunction.OutQuart);

      const minutes = Math.floor(remainingSeconds / 60);
      const seconds = Math.floor(remainingSeconds % 60);

      this.scheduler.addDelayed(() => {
        this.#spriteText.text = [
          minutes,
          seconds >= 10 ? seconds : `0${seconds}`,
        ].join(':');
      }, 20);

      this.#middlePiece
        .scaleTo(1.02, 100, EasingFunction.OutExpo)
        .then()
        .scaleTo(1, 900, EasingFunction.OutElastic);

      this.#outerPiece
        .scaleTo(1.02, 100, EasingFunction.OutExpo)
        .then()
        .scaleTo(1, 900, EasingFunction.OutElastic);

      this.#ringFill.fadeColor(0x444448, 100, EasingFunction.OutExpo)
        .then()
        .fadeColor(0x222228, 900);

      this.#arc
        .transformTo('progress', remainingSeconds / this.totalDuration, 300, EasingFunction.OutExpo);
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
