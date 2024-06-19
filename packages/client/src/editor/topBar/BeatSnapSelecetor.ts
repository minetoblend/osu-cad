import { dependencyLoader, resolved } from '@/framework/di/DependencyLoader';
import { ContainerDrawable } from '@/framework/drawable/ContainerDrawable';
import { DrawableOptions } from '@/framework/drawable/Drawable';
import { EditorClock } from '../EditorClock';
import { DrawableSprite } from '@/framework/drawable/DrawableSprite';
import { Anchor } from '@/framework/drawable/Anchor';
import { MarginPadding } from '@/framework/drawable/MarginPadding';
import { DrawableText } from '@/framework/drawable/SpriteText';
import { MouseDownEvent } from '@/framework/input/events/MouseEvent';
import gsap from 'gsap';
import { AudioManager } from '@/framework/audio/AudioManager';
import { UISamples } from '../UISamples';
import { MenuContainer } from '../components/MenuContainer';
import { MenuItem } from '../components/MenuItem';

export class BeatSnapSelector extends ContainerDrawable {
  constructor(options: DrawableOptions) {
    super({
      ...options,
      width: 62,
      height: 36,
      margin: new MarginPadding(8),
    });
  }

  @resolved(EditorClock)
  clock!: EditorClock;

  label = new DrawableText({
    text: '1/4',
    anchor: Anchor.TopCentre,
    origin: Anchor.TopCentre,
    fontSize: 19,
  });

  snapTypes = [1, 2, 3, 4, 6, 8, 12, 16];

  @dependencyLoader()
  loaded() {
    this.add(this.label);
    this.add(
      new BeatSnapSelectorButton({
        texture: '/assets/ui/chevron-right.png',
        scale: { x: -1, y: 1 },
        x: -6,
        y: 1,
        origin: Anchor.TopLeft,
        anchor: Anchor.TopRight,
        action: () => {
          this.decrementSnap();
        },
      }),
    );
    this.add(
      new BeatSnapSelectorButton({
        texture: '/assets/ui/chevron-right.png',
        x: 6,
        y: 1,
        origin: Anchor.TopRight,
        anchor: Anchor.TopRight,
        action: () => {
          this.incrementSnap();
        },
      }),
    );
    this.add(
      new DrawableText({
        text: 'beat snap',
        fontFamily: 'nunito-sans-700',
        fontSize: 10,
        anchor: Anchor.BottomCentre,
        origin: Anchor.BottomCentre,
        color: 0x32d2ac,
      }),
    );
  }

  decrementSnap() {
    this.playSound();
    let index = this.snapTypes.findIndex(
      (it) => it >= this.clock.beatSnapDivisor,
    );
    if (index < 0) {
      index = 0;
    }
    if (index > 0) {
      index--;
      this.clock.beatSnapDivisor = this.snapTypes[index];
      this.updateText(-1);
    }
  }

  incrementSnap() {
    this.playSound();
    let index = this.snapTypes.indexOf(this.clock.beatSnapDivisor);

    if (index < 0)
      index = Math.max(
        0,
        this.snapTypes.findIndex((it) => it >= this.clock.beatSnapDivisor) - 1,
      );
    if (index < this.snapTypes.length - 1) {
      index++;
      this.clock.beatSnapDivisor = this.snapTypes[index];
      this.updateText(1);
    }
  }

  updateText(movement: number) {
    // this.label.text = `1/${this.clock.beatSnapDivisor}`;
    const oldLabel = this.label;
    gsap.to(oldLabel, {
      x: oldLabel.x + 10 * movement,
      alpha: 0,
      duration: 0.15,
      onComplete: () => {
        oldLabel.destroy();
      },
    });

    this.label = new DrawableText({
      text: `1/${this.clock.beatSnapDivisor}`,
      anchor: Anchor.TopCentre,
      origin: Anchor.TopCentre,
      fontSize: 19,
    });

    this.add(this.label);

    gsap.from(this.label, {
      x: this.label.x - 10 * movement,
      alpha: 0,
      duration: 0.15,
    });
  }

  playSound() {
    this.dependencies.resolve(AudioManager).playSound(
      {
        buffer: this.dependencies.resolve(UISamples).click,
      },
      'ui',
    );
  }

  onMouseDown(event: MouseDownEvent): boolean {
    if (event.right) {
      this.dependencies.resolve(MenuContainer).show(this, [
        new MenuItem({
          text: 'Standard',
          items: [
            new MenuItem({
              text: '1/1',
              action: () => {
                this.clock.beatSnapDivisor = 1;
                this.updateText(0);
              },
            }),
            new MenuItem({
              text: '1/2',
              action: () => {
                this.clock.beatSnapDivisor = 2;
                this.updateText(0);
              },
            }),
            new MenuItem({
              text: '1/4',
              action: () => {
                this.clock.beatSnapDivisor = 3;
                this.updateText(0);
              },
            }),
            new MenuItem({
              text: '1/8',
              action: () => {
                this.clock.beatSnapDivisor = 4;
                this.updateText(0);
              },
            }),
            new MenuItem({
              text: '1/18',
              action: () => {
                this.clock.beatSnapDivisor = 6;
                this.updateText(0);
              },
            }),
          ],
        }),
        new MenuItem({
          text: 'Swing / Thirds',
          items: [
            new MenuItem({
              text: '1/3',
              action: () => {
                this.clock.beatSnapDivisor = 1;
                this.updateText(0);
              },
            }),
            new MenuItem({
              text: '1/6',
              action: () => {
                this.clock.beatSnapDivisor = 2;
                this.updateText(0);
              },
            }),
            new MenuItem({
              text: '1/12',
              action: () => {
                this.clock.beatSnapDivisor = 3;
                this.updateText(0);
              },
            }),
          ],
        }),
        new MenuItem({
          text: 'Other',
          items: [
            new MenuItem({
              text: '1/5',
              action: () => {
                this.clock.beatSnapDivisor = 5;
                this.updateText(0);
              },
            }),
            new MenuItem({
              text: '1/7',
              action: () => {
                this.clock.beatSnapDivisor = 7;
                this.updateText(0);
              },
            }),
            new MenuItem({
              text: '1/9',
              action: () => {
                this.clock.beatSnapDivisor = 9;
                this.updateText(0);
              },
            }),
            new MenuItem({
              text: '1/10',
              action: () => {
                this.clock.beatSnapDivisor = 10;
                this.updateText(0);
              },
            }),
            new MenuItem({
              text: '1/11',
              action: () => {
                this.clock.beatSnapDivisor = 11;
                this.updateText(0);
              },
            }),
            new MenuItem({
              text: '1/13',
              action: () => {
                this.clock.beatSnapDivisor = 13;
                this.updateText(0);
              },
            }),
            new MenuItem({
              text: '1/14',
              action: () => {
                this.clock.beatSnapDivisor = 14;
                this.updateText(0);
              },
            }),
            new MenuItem({
              text: '1/15',
              action: () => {
                this.clock.beatSnapDivisor = 15;
                this.updateText(0);
              },
            }),
          ],
        }),
      ]);
      return true;
    }
    return false;
  }
}

export class BeatSnapSelectorButton extends ContainerDrawable {
  constructor(
    options: { texture: string; action: () => void } & DrawableOptions,
  ) {
    const { texture, action, ...rest } = options;

    super({
      ...rest,
      width: 20,
      height: 20,
      alpha: 0.5,
      children: [
        new DrawableSprite({
          texture,
          anchor: Anchor.Centre,
          origin: Anchor.Centre,
          width: 4,
          height: 10,
          scale: { x: 1.1, y: 1.1 },
        }),
      ],
    });

    this.action = action;
  }

  action: () => void;

  onHover(): boolean {
    this.alpha = 1;
    return true;
  }

  onHoverLost(): boolean {
    this.alpha = 0.5;
    return true;
  }

  onMouseDown(event: MouseDownEvent): boolean {
    if (event.left) {
      this.action();
    }
    return true;
  }
}
