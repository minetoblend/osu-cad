import { Anchor } from '@/framework/drawable/Anchor';
import { ContainerDrawable } from '@/framework/drawable/ContainerDrawable';
import { DrawableSprite } from '@/framework/drawable/DrawableSprite';
import { Beatmap, Vec2 } from '@osucad/common';
import { Assets } from 'pixi.js';
import { dependencyLoader, resolved } from '../framework/di/DependencyLoader';
import { Axes } from '../framework/drawable/Axes';
import { DrawableOptions } from '@/framework/drawable/Drawable';

export class BeatmapBackground extends ContainerDrawable {
  constructor(
    options: DrawableOptions = {}
  ) {
    super({
      relativeSizeAxes: Axes.Both,
      anchor: Anchor.Centre,
      origin: Anchor.Centre,
      ...options,
    });
  }

  @resolved(Beatmap)
  beatmap!: Beatmap;

  @dependencyLoader()
  async load() {
    const texture = await Assets.load(
      `/api/mapsets/${this.beatmap.setId}/files/${this.beatmap.backgroundPath}`,
    );
    this.add(
      new DrawableSprite({
        texture,
        anchor: Anchor.Centre,
        origin: Anchor.Centre,
        scale: new Vec2(Math.max(1000 / texture.width, 540 / texture.height)),
        alpha: 0.75,
      }),
    );
  }

  updateSpriteTransform() {}
}
