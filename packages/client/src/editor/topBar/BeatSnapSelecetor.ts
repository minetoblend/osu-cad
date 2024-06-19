import { dependencyLoader, resolved } from '@/framework/di/DependencyLoader';
import { ContainerDrawable } from '@/framework/drawable/ContainerDrawable';
import { DrawableOptions } from '@/framework/drawable/Drawable';
import { EditorClock } from '../EditorClock';
import { DrawableSprite } from '@/framework/drawable/DrawableSprite';
import { Anchor } from '@/framework/drawable/Anchor';
import { MarginPadding } from '@/framework/drawable/MarginPadding';
import { DrawableText } from '@/framework/drawable/SpriteText';
import { MouseDownEvent } from '@/framework/input/events/MouseEvent';
import { E } from 'unplugin-vue-router/dist/options-8dbadba3';
import gsap from 'gsap';
import { AudioManager } from '@/framework/audio/AudioManager';
import { UISamples } from '../UISamples';

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
    this.playSound()
    let index = this.snapTypes.indexOf(this.clock.beatSnapDivisor);
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
    this.playSound()
    let index = this.snapTypes.indexOf(this.clock.beatSnapDivisor);
    if (index < 0) index = 0;
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
    this.dependencies.resolve(AudioManager).playSound({
      buffer: this.dependencies.resolve(UISamples).click,
    }, 'ui')
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
