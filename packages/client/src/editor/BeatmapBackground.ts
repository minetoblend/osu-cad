import { Assets, Container, Sprite } from 'pixi.js';
import { Drawable } from '../framework/drawable/Drawable';
import { dependencyLoader, resolved } from '../framework/di/DependencyLoader';
import { Axes } from '../framework/drawable/Axes';
import gsap from 'gsap';
import { Beatmap } from '@osucad/common';

export class BeatmapBackground extends Drawable {
  drawNode = new Container();

  constructor() {
    super();
    this.relativeSizeAxes = Axes.Both;
  }

  @resolved(Beatmap)
  beatmap!: Beatmap;

  @dependencyLoader()
  async load() {
    const texture = await Assets.load(
      `/api/mapsets/${this.beatmap.setId}/files/${this.beatmap.backgroundPath}`,
    );
    const sprite = this.drawNode.addChild(new Sprite({ texture }));
    sprite.anchor.set(0.5);
    sprite.scale.set(Math.max(1000 / texture.width, 540 / texture.height));
    sprite.position.set(512 / 2, 384 / 2);
    this.drawNode.alpha = 0;
    gsap.to(this.drawNode, {
      alpha: 0.75,
      duration: 0.5,
    });
  }

  updateSpriteTransform() {}
}
