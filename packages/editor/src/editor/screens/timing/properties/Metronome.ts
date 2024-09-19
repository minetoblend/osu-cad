import type { KeyDownEvent, KeyUpEvent } from 'osucad-framework';
import { Anchor, Axes, Box, CompositeDrawable, Container, dependencyLoader, EasingFunction, FillDirection, FillFlowContainer, Key, resolved } from 'osucad-framework';
import { FastRoundedBox } from '../../../../drawables/FastRoundedBox.ts';
import { EditorClock } from '../../../EditorClock.ts';
import { ThemeColors } from '../../../ThemeColors.ts';

export class Metronome extends CompositeDrawable {
  @resolved(ThemeColors)
  colors!: ThemeColors;

  @dependencyLoader()
  load() {
    this.relativeSizeAxes = Axes.X;
    this.autoSizeAxes = Axes.Y;

    this.addInternal(
      new FillFlowContainer({
        relativeSizeAxes: Axes.X,
        autoSizeAxes: Axes.Y,
        children: [
          this.#flashContainer = new FillFlowContainer({
            relativeSizeAxes: Axes.X,
            direction: FillDirection.Horizontal,
            height: 40,
            padding: { right: -10 },
          }),
          new Container({
            height: 40,
            relativeSizeAxes: Axes.X,
            padding: 10,
            children: [
              new Box({
                relativeSizeAxes: Axes.X,
                height: 2,
                color: 0x3C3C47,
                alpha: 0.5,
                anchor: Anchor.Center,
                origin: Anchor.Center,
              }),
              this.leftBox = new Box({
                size: 12,
                color: 0x3C3C47,
                anchor: Anchor.CenterLeft,
                origin: Anchor.Center,
                rotation: Math.PI / 4,
              }),
              this.centerBox = new Box({
                size: 8,
                color: 0x3C3C47,
                anchor: Anchor.Center,
                origin: Anchor.Center,
                rotation: Math.PI / 4,
              }),
              this.rightBox = new Box({
                size: 12,
                color: 0x3C3C47,
                anchor: Anchor.CenterRight,
                origin: Anchor.Center,
                rotation: -Math.PI / 4,
              }),
              this.tick = new FastRoundedBox({
                size: 10,
                cornerRadius: 5,
                color: this.colors.text,
                anchor: Anchor.CenterLeft,
                origin: Anchor.Center,
                relativePositionAxes: Axes.X,
              }),
            ],
          }),
        ],
      }),
    );

    for (let i = 0; i < 4; i++) {
      this.#flashContainer.add(
        new Container({
          relativeSizeAxes: Axes.Both,
          width: 0.25,
          padding: { right: 10 },
          color: 0x3C3C47,
          child: new FastRoundedBox({
            relativeSizeAxes: Axes.Both,
            cornerRadius: 6,
          }),
        }),
      );
    }
  }

  #flashContainer!: FillFlowContainer;

  leftBox!: Box;
  centerBox!: Box;
  rightBox!: Box;
  tick!: FastRoundedBox;

  @resolved(EditorClock)
  editorClock!: EditorClock;

  lastBeat = 0;

  update() {
    super.update();

    let progress = this.editorClock.beatProgress;

    if (this.editorClock.beatIndex % 2 === 1) {
      progress = 1 - progress;
    }

    let beatIndex = this.editorClock.timingPointProgress;

    if (this.doubleSpeed) {
      beatIndex = Math.floor(beatIndex * 2) / 2;
    }
    else {
      beatIndex = Math.floor(beatIndex);
    }

    if (this.lastBeat !== beatIndex) {
      let side = beatIndex % 2 === 0 ? this.leftBox : this.rightBox;

      if (beatIndex % 1 !== 0)
        side = this.centerBox;

      side.fadeColor(this.colors.text).fadeColor(0x3C3C47, 300, EasingFunction.OutExpo);
      side.scaleTo(1.2).scaleTo(1, 300, EasingFunction.OutExpo);

      const flash = this.#flashContainer.children[beatIndex * (this.doubleSpeed ? 2 : 1) % 4];
      if (flash) {
        const flashColor = beatIndex % 4 === 0 ? this.colors.primary : this.colors.text;

        flash.fadeColor(flashColor).fadeColor(0x3C3C47, 400, EasingFunction.OutExpo);
      }
    }

    this.lastBeat = beatIndex;

    this.tick.x = progress;
  }

  doubleSpeed = false;

  onKeyDown(e: KeyDownEvent): boolean {
    if (e.key === Key.ControlLeft) {
      this.doubleSpeed = true;
    }

    return false;
  }

  onKeyUp(e: KeyUpEvent) {
    if (e.key === Key.ControlLeft)
      this.doubleSpeed = false;
  }
}
