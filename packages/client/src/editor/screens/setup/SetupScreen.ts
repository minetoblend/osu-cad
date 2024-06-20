import { CustomBackdropBlur } from '@/editor/filters/CustomBackdropBlur';
import { Anchor } from '@/framework/drawable/Anchor';
import { Axes } from '@/framework/drawable/Axes';
import { ContainerDrawable } from '@/framework/drawable/ContainerDrawable';
import { RoundedBox } from '@/framework/drawable/RoundedBox';
import gsap from 'gsap';
import { EditorScreen } from '../EditorScreen';
import { AlphaFilter } from 'pixi.js';
import { dependencyLoader, resolved } from '@/framework/di/DependencyLoader';
import { BeatmapBackground } from '@/editor/BeatmapBackground';
import { Drawable } from '@/framework/drawable/Drawable';
import { BeatmapBackgroundSelector } from './BeatmapBackgroundSelector';

export class SetupScreen extends EditorScreen {
  alphaFilter = new AlphaFilter({ alpha: 1 });

  @resolved(BeatmapBackground)
  background!: BeatmapBackground;

  backgroundSelector!: BeatmapBackgroundSelector;

  innerContainer = new ContainerDrawable<Drawable>({
    relativeSizeAxes: Axes.Both,
    relativePositionAxes: Axes.Y,
    width: 0.65,
    height: 1.5,
    anchor: Anchor.TopCentre,
    origin: Anchor.TopCentre,
    children: [
      new RoundedBox({
        relativeSizeAxes: Axes.Both,
        alpha: 0.75,
        color: 0x222228,
        cornerRadius: 6,
      }),
    ],
  });

  @dependencyLoader()
  load() {
    this.add(this.innerContainer);
    const [filter] = (this.innerContainer.drawNode.filters = [
      new CustomBackdropBlur({
        strength: 50,
        quality: 4,
      }),
      this.alphaFilter,
    ] as const);
    filter.padding = 50;

    const mask = new RoundedBox({
      relativeSizeAxes: Axes.Both,
      cornerRadius: 6,
    });
    this.innerContainer.add(mask);
    this.innerContainer.drawNode.mask = mask.drawNode;

    this.backgroundSelector = this.innerContainer.add(new BeatmapBackgroundSelector());    
  }

  show() {
    gsap.from(this.innerContainer, {
      y: 1,
      duration: 0.5,
      ease: 'power4.out',
    });
    gsap.from(this.alphaFilter, {
      alpha: 0,
      duration: 0.5,
      ease: 'power2.out',
    });
    gsap.to(this.background, {
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 0.5,
      ease: 'power3.out',
    });
    this.backgroundSelector.show();
  }

  hide(done: () => void) {
    gsap.to(this.innerContainer, {
      y: 1,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: done,
    });
    gsap.to(this.alphaFilter, {
      alpha: 0,
      duration: 0.3,
    });
  }
}
