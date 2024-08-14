import type {
  Drawable,
  Vec2,
} from 'osucad-framework';
import {
  Anchor,
  Axes,
  Container,
  DrawableSprite,
  FillMode,
  RoundedBox,
  almostEquals,
  dependencyLoader,
  lerp,
  resolved,
} from 'osucad-framework';

import gsap from 'gsap';
import { OsucadSpriteText } from '../OsucadSpriteText';
import { FastRoundedBox } from '../drawables/FastRoundedBox';
import type { MapsetInfo } from './MapsetInfo';
import { DrawableCarouselItem } from './DrawableCarouselItem';
import { CarouselMapset } from './CarouselMapset';
import { DrawableCarouselBeatmap } from './DrawableCarouselBeatmap';
import { UserWithAvatar } from './UserWithAvatar';
import { CarouselLoadQueue } from './CarouselLoadQueue';

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
          this.creatorInfo = this.createCreatorInfo().apply({
            anchor: Anchor.CenterRight,
            origin: Anchor.CenterRight,
          }),
        ],
      }),
    );
  }

  beatmapsCreated = false;

  @dependencyLoader()
  load() {
    this.header.height = CarouselMapset.HEIGHT;
  }

  #beatmapContainer!: Container<DrawableCarouselBeatmap>;

  #background!: MapsetBackground;

  override item!: CarouselMapset;

  readonly mapset: MapsetInfo;

  creatorInfo!: Drawable;

  protected selected() {
    super.selected();

    gsap.to(this.movementContainer, {
      x: -100,
      duration: 0.5,
      ease: 'expo.out',
    });

    if (!this.beatmapsCreated) {
      this.beatmapsCreated = true;
      this.#beatmapContainer.clear();
      this.#beatmapContainer.addAll(
        ...this.item.beatmaps.map(item =>
          new DrawableCarouselBeatmap(item),
        ),
      );
    }

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
      it.expire();
    });
    this.beatmapsCreated = false;
  }

  createCreatorInfo() {
    if (this.mapset.author) {
      return new UserWithAvatar(this.mapset.author);
    }

    return new OsucadSpriteText({
      text: this.mapset.authorName,
      fontSize: 16,
      alpha: 0.8,
    });
  }

  update() {
    super.update();

    this.creatorInfo.x = -this.header.x - this.movementContainer.x;

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

  get parallax() {
    return this.#background.parallax;
  }

  set parallax(value: number) {
    this.#background.parallax = value;
  }

  get beatmaps() {
    return this.#beatmapContainer.children;
  }

  receivePositionalInputAt(screenSpacePosition: Vec2): boolean {
    return this.header.receivePositionalInputAt(screenSpacePosition);
  }
}

class MapsetBackground extends Container {
  constructor(readonly mapset: MapsetInfo) {
    super({
      relativeSizeAxes: Axes.Both,
    });

    this.addInternal(new FastRoundedBox({
      relativeSizeAxes: Axes.Both,
      cornerRadius: 10,
      color: 0x282832,
    }));
  }

  @resolved(CarouselLoadQueue)
  carouselLoadQueue!: CarouselLoadQueue;

  @dependencyLoader()
  load() {
    // scheduling this with 50ms delay to avoid loading too many textures at once when fast-seeking
    this.scheduler.addDelayed(() => this.loadBackground(), 50);
  }

  async loadBackground() {
    const texture = await this.mapset.loadThumbnailLarge();
    if (!texture)
      return;

    const mask = new RoundedBox({
      relativeSizeAxes: Axes.Both,
      cornerRadius: 10,
    });

    const background = this.background = new DrawableSprite({
      relativeSizeAxes: Axes.Both,
      fillMode: FillMode.Fill,
      fillAspectRatio: texture.width / texture.height,
      texture,
      color: 'rgb(168, 168, 168)',
      anchor: Anchor.Center,
      origin: Anchor.Center,
    });

    background.drawNode.mask = mask.drawNode;

    this.onDispose(() => texture.destroy());

    this.carouselLoadQueue.add({
      load: () => {
        this.addAll(background, mask);
        background.y = this.parallax * this.parallaxMultiplier;

        background.fadeIn({ duration: 250 });
      },
      shouldLoad: () => !this.isDisposed,
    });
  }

  background?: DrawableSprite;

  #parallax = 0;

  get parallax() {
    return this.#parallax;
  }

  set parallax(value: number) {
    if (value === this.#parallax)
      return;

    this.#parallax = value;
  }

  updateParallax() {
    if (this.background) {
      const targetY = this.#parallax * this.parallaxMultiplier;
      this.background.y = lerp(targetY, this.background.y, Math.exp(-0.01 * this.time.elapsed));
    }
  }

  update() {
    super.update();

    this.updateParallax();
  }

  get parallaxMultiplier() {
    return 50;
  }
}
