import type {
  Vec2,
} from 'osucad-framework';
import {
  Anchor,
  Axes,
  Container,
  FillMode,
  RoundedBox,
  almostEquals,
  dependencyLoader,
  lerp,
  loadTexture,
} from 'osucad-framework';
import gsap from 'gsap';
import { OsucadSpriteText } from '../OsucadSpriteText';
import { FastRoundedBox } from '../drawables/FastRoundedBox';
import type { MapsetInfo } from '../beatmaps/MapsetInfo';
import { DrawableCarouselItem } from './DrawableCarouselItem';
import { CarouselMapset } from './CarouselMapset';
import { DrawableCarouselBeatmap } from './DrawableCarouselBeatmap';
import { UserWithAvatar } from './UserWithAvatar';

export class DrawableCarouselMapset extends DrawableCarouselItem {
  static HEIGHT = 80;

  constructor(item: CarouselMapset) {
    super(item);

    this.drawNode.enableRenderGroup();

    this.mapset = item.mapset;

    this.add(this.#beatmapContainer = new Container({
      relativeSizeAxes: Axes.Both,
      x: 100,
      padding: { top: DrawableCarouselMapset.HEIGHT },
      children: this.item.beatmaps.map(item =>
        new DrawableCarouselBeatmap(item),
      ),
    }));

    this.header.addAll(
      this.#background = new MapsetBackground(this.mapset),
      new Container({
        relativeSizeAxes: Axes.Both,
        padding: { horizontal: 20, vertical: 6 },
        children: [
          new OsucadSpriteText({
            text: this.mapset.title,
            fontSize: 18,
          }),
          new OsucadSpriteText({
            text: this.mapset.artist,
            fontSize: 16,
            alpha: 0.8,
            y: 20,
          }),
          this.avatar = new UserWithAvatar(this.mapset.creator).apply({
            anchor: Anchor.CenterRight,
            origin: Anchor.CenterRight,
          }),
        ],
      }),
    );
  }

  @dependencyLoader()
  load() {
    this.header.height = CarouselMapset.HEIGHT;
  }

  #beatmapContainer!: Container;

  #background!: MapsetBackground;

  override item!: CarouselMapset;

  readonly mapset: MapsetInfo;

  avatar!: UserWithAvatar;

  protected selected() {
    super.selected();

    gsap.to(this.movementContainer, {
      x: -100,
      duration: 0.5,
      ease: 'expo.out',
    });

    this.beatmaps.forEach(it => it.fadeIn({ duration: 400 }));

    this.#updateBeatmapYPositions();
  }

  protected deselected() {
    super.deselected();

    gsap.to(this.movementContainer, {
      x: 0,
      duration: 0.5,
      ease: 'power4.out',
    });

    this.#updateBeatmapYPositions();

    this.beatmaps.forEach((it) => {
      gsap.killTweensOf(it, 'alpha');
      it.fadeOut({ duration: 100 });
    });
  }

  update() {
    super.update();

    this.avatar.x = -this.header.x - this.movementContainer.x;

    const targetY = this.item.carouselYPosition;

    if (almostEquals(this.y, targetY, 0.01)) {
      this.y = targetY;
    }
    else {
      this.y = lerp(targetY, this.y, Math.exp(-0.01 * this.time.elapsed));
    }
  }

  #updateBeatmapYPositions() {
    let yPos = 5;

    const isSelected = this.item.selected.value;

    for (const child of this.#beatmapContainer.children) {
      const panel = child as DrawableCarouselBeatmap;

      if (isSelected) {
        gsap.to(panel, {
          y: yPos,
          duration: 0.5,
          ease: 'power4.out',
        });
        yPos += panel.item.totalHeight;
      }
      else {
        gsap.to(panel, {
          y: 0,
          duration: 0.5,
          ease: 'power4.out',
        });
      }
    }
  }

  get beatmaps() {
    return this.#beatmapContainer.children as DrawableCarouselBeatmap[];
  }

  receivePositionalInputAt(screenSpacePosition: Vec2): boolean {
    return this.header.receivePositionalInputAt(screenSpacePosition);
  }
}

class MapsetBackground extends Container {
  constructor(mapset: MapsetInfo) {
    super({
      relativeSizeAxes: Axes.Both,
    });

    this.addInternal(new FastRoundedBox({
      relativeSizeAxes: Axes.Both,
      cornerRadius: 10,
      color: 0x282832,
    }));

    this.scheduler.addDelayed(() => {
      const url = mapset.thumbnailLarge;
      if (url) {
        loadTexture(url).then((texture) => {
          if (!texture)
            return;

          const background = new RoundedBox({
            relativeSizeAxes: Axes.Both,
            texture,
            cornerRadius: 10,
            textureFillMode: FillMode.Fill,
            color: 'rgb(168, 168, 168)',
          });

          this.onDispose(() => texture.destroy());

          this.add(background);
        });
      }
    }, 20);
  }
}
