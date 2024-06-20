import { dependencyLoader, resolved } from '@/framework/di/DependencyLoader';
import { Anchor } from '@/framework/drawable/Anchor';
import { Axes } from '@/framework/drawable/Axes';
import { Box } from '@/framework/drawable/Box';
import { ContainerDrawable } from '@/framework/drawable/ContainerDrawable';
import { DrawableSprite } from '@/framework/drawable/DrawableSprite';
import { DrawsizePreservingContainer } from '@/framework/drawable/DrawsizePreservingContainer';
import { Fit } from '@/framework/drawable/Fit';
import { DrawableText } from '@/framework/drawable/SpriteText';
import { Beatmap, Vec2 } from '@osucad/common';
import gsap from 'gsap';
import { Assets } from 'pixi.js';

export class BeatmapBackgroundSelector extends ContainerDrawable {
  constructor() {
    super({
      relativeSizeAxes: Axes.X,
      height: 200,
    });

    this.backgroundContainer = this.add(
      new DrawsizePreservingContainer({
        width: 512,
        height: 384,
        fit: Fit.Cover,
      }),
    );

    this.add(new DrawableText({
      text: 'Select Background',
      anchor: Anchor.Centre,
      origin: Anchor.Centre,
    }))

    this.backgroundContainer.anchor = Anchor.Centre;
    this.backgroundContainer.origin = Anchor.Centre;

    const mask = this.add(
      new Box({
        relativeSizeAxes: Axes.Both,
      }),
    );
    this.drawNode.mask = mask.drawNode;
  }

  backgroundContainer!: DrawsizePreservingContainer;

  @resolved(Beatmap)
  beatmap!: Beatmap;

  @dependencyLoader()
  load() {
    Assets.load(
      `/api/mapsets/${this.beatmap.setId}/files/${this.beatmap.backgroundPath}`,
    ).then((texture) => {
      this.backgroundContainer.desiredSize = new Vec2(
        texture.width,
        texture.height,
      );
      this.backgroundContainer.add(
        new DrawableSprite({
          texture,
          anchor: Anchor.Centre,
          origin: Anchor.Centre,
          relativePositionAxes: Axes.Both,
          scale: new Vec2(1.5),
        }),
      );
    });
  }

  show() {
    gsap.from(this.backgroundContainer, {
      y: -300,
      scaleX: 0.5,
      scaleY: 0.5,
      duration: 0.5,
      ease: 'power4.out',
    });
  }
}
