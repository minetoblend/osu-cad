import {
  ContainerDrawable,
  ContainerDrawableOptions,
} from '../../framework/drawable/ContainerDrawable.ts';
import { DrawableSprite } from '../../framework/drawable/DrawableSprite.ts';
import { Vec2 } from '@osucad/common';
import { Anchor } from '../../framework/drawable/Anchor.ts';
import { Axes } from '../../framework/drawable/Axes.ts';
import { Invalidation } from '../../framework/drawable/Invalidation.ts';
import { gsap } from 'gsap';
import {
  dependencyLoader,
  resolved,
} from '../../framework/di/DependencyLoader.ts';
import { Assets, Texture } from 'pixi.js';
import { EditorClock } from '../EditorClock.ts';

export class PlayButtonContainer extends ContainerDrawable {
  constructor(options: ContainerDrawableOptions = {}) {
    super(options);

    this.add(
      new PlayButton({
        relativeSizeAxes: Axes.Both,
        anchor: Anchor.Centre,
        origin: Anchor.Centre,
      }),
    );
  }
}

class PlayButton extends ContainerDrawable {
  constructor(options: ContainerDrawableOptions = {}) {
    super(options);

    this.sprite = this.add(
      new DrawableSprite({
        size: new Vec2(28, 28),
        anchor: Anchor.Centre,
        origin: Anchor.Centre,
        color: 0xb6b6c3,
      }),
    );
  }

  playTexture!: Texture;
  pauseTexture!: Texture;

  @dependencyLoader()
  async load() {
    this.playTexture = await Assets.load('/assets/ui/play.png');
    this.pauseTexture = await Assets.load('/assets/ui/pause.png');
    this.sprite.texture = this.playTexture;
  }

  sprite: DrawableSprite;

  onHover(): boolean {
    // this.scale = new Vec2(1.1, 1.1);
    this.sprite.color = 0xffffff;
    return true;
  }

  onHoverLost(): boolean {
    this.sprite.color = 0xb6b6c3;
    // this.scale = new Vec2(1, 1);
    return true;
  }

  onMouseDown() {
    gsap.to(this.sprite.scale, {
      x: 0.9,
      y: 0.9,
      duration: 0.1,
      ease: 'power2.out',
      onUpdate: () => {
        this.sprite.invalidate(Invalidation.Transform | Invalidation.DrawSize);
      },
    });
    if (this.clock.isPlaying) {
      this.clock.pause();
    } else {
      this.clock.play();
    }
    return true;
  }

  onMouseUp(): boolean {
    gsap.to(this.sprite.scale, {
      x: 1,
      y: 1,
      duration: 0.1,
      ease: 'power2.out',
      onUpdate: () => {
        this.sprite.invalidate(Invalidation.Transform | Invalidation.DrawSize);
      },
    });
    return true;
  }

  #isPlaying = false;

  @resolved(EditorClock)
  clock!: EditorClock;

  onTick() {
    if (this.#isPlaying !== this.clock.isPlaying) {
      this.#isPlaying = this.clock.isPlaying;
      this.sprite.texture = this.#isPlaying
        ? this.pauseTexture
        : this.playTexture;
    }
  }
}
