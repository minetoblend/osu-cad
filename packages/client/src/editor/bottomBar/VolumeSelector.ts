import { dependencyLoader } from '@/framework/di/DependencyLoader';
import { Anchor } from '@/framework/drawable/Anchor';
import { Axes } from '@/framework/drawable/Axes';
import { ContainerDrawable } from '@/framework/drawable/ContainerDrawable';
import { DrawableOptions } from '@/framework/drawable/Drawable';
import { RoundedBox } from '@/framework/drawable/RoundedBox';
import gsap from 'gsap';
import { DropShadowFilter } from 'pixi-filters';
import { AlphaFilter } from 'pixi.js';
import { CustomBackdropBlur } from '../filters/CustomBackdropBlur';
import { VolumeKnob } from './VolumeKnob';

export class VolumeSelector extends ContainerDrawable {
  constructor(options: DrawableOptions) {
    super({
      ...options,
      width: 220,
      height: 160,
    });

    const background = this.addInternal(
      new RoundedBox({
        relativeSizeAxes: Axes.Both,
        color: 0x222228,
        alpha: 0.5,
        cornerRadius: 16,
      }),
    );

    const [filter] = (background.drawNode.filters = [
      new CustomBackdropBlur({
        strength: 16,
        quality: 3,
      }),
      new DropShadowFilter({
        offset: {
          x: 0,
          y: 0,
        },
      }),
      this.alphaFilter,
    ]);

    filter.padding = 32;

    this.addInternal(this.innerContainer);
    this.innerContainer.drawNode.filters = [this.alphaFilter];

    this.leftKnob = this.add(
      new VolumeKnob({
        label: 'Hitsounds',
        channel: 'hitsoundVolume',
        width: 64,
        height: 64,
        anchor: Anchor.TopLeft,
        origin: Anchor.TopLeft,
        y: 30,
      }),
    );
    this.centerKnob = this.add(
      new VolumeKnob({
        label: 'Music',
        channel: 'musicVolume',
        width: 64,
        height: 64,
        anchor: Anchor.TopCentre,
        origin: Anchor.TopCentre,
      }),
    );
    this.rightKnob = this.add(
      new VolumeKnob({
        label: 'Interface',
        channel: 'uiVolume',
        width: 64,
        height: 64,
        anchor: Anchor.TopRight,
        origin: Anchor.TopRight,
        y: 30,
      }),
    );
    this.add(
      new VolumeKnob({
        label: 'Master',
        channel: 'masterVolume',
        width: 64,
        height: 64,
        scale: {
          x: 1.5,
          y: 1.5,
        },
        anchor: Anchor.BottomCentre,
        origin: Anchor.BottomCentre,
        y: 10,
      }),
    );
    // background.drawNode.filters.push(this.alphaFilter);
    this.hide(true);
  }

  innerContainer = new ContainerDrawable({
    relativeSizeAxes: Axes.Both,
    padding: 8,
  });

  leftKnob: VolumeKnob;
  centerKnob: VolumeKnob;
  rightKnob: VolumeKnob;
  alphaFilter = new AlphaFilter({ alpha: 0 });

  override get alpha() {
    return this.alphaFilter.alpha;
  }

  override set alpha(value: number) {
    this.alphaFilter.alpha = value;
  }

  get content() {
    return this.innerContainer;
  }

  @dependencyLoader()
  load() {}

  shown = true;

  showTimeout: any = null;

  show(withTimeout = false) {
    this.shown = true;
    this.innerContainer.isPresent = true;
    gsap.to(this, {
      alpha: 1,
      y: 0,
      duration: 0.4,
      ease: 'power2.out',
    });
    gsap.to(this.leftKnob, {
      x: 0,
      duration: 0.4,
      ease: 'power1.out',
    });
    gsap.to(this.rightKnob, {
      x: 0,
      duration: 0.4,
      ease: 'power1.out',
    });
    gsap.to(this.centerKnob, {
      y: 0,
      duration: 0.4,
      ease: 'power1.out',
    });

    if (withTimeout) {
      if (this.showTimeout) clearTimeout(this.showTimeout);
      this.showTimeout = setTimeout(() => {
        if (!this.hovered) {
          this.hide();
        }
      }, 2000);
    }
  }

  hide(immediate = false) {
    this.shown = false;
    if (immediate) {
      this.alpha = 0;
      this.y = 50;
      this.innerContainer.isPresent = false;
      this.leftKnob.x = 20;
      this.centerKnob.y = 20;
      this.rightKnob.x = -20;
      return;
    }
    gsap.to(this, {
      alpha: 0,
      duration: 0.3,
      y: 50,
      ease: 'power1.in',
      onComplete: () => {
        if (!this.shown) this.innerContainer.isPresent = false;
      },
    });
    gsap.to(this.leftKnob, {
      x: 20,
      duration: 0.3,
      ease: 'power1.in',
    });
    gsap.to(this.rightKnob, {
      x: -20,
      duration: 0.3,
      ease: 'power1.in',
    });
    gsap.to(this.centerKnob, {
      y: 20,
      duration: 0.3,
      ease: 'power1.in',
    });
  }

  onHoverLost(): boolean {
    setTimeout(() => {
      if (!this.hovered) {
        this.hide();
      }
    }, 500);
    return true;
  }
}
