import type { HoverLostEvent, Vec2 } from 'osucad-framework';
import type { ImageSource } from 'pixi.js';
import type { MapsetInfo } from './MapsetInfo';
import { OsucadConfigManager, OsucadSettings } from '@osucad/common';
import { almostEquals, Anchor, Axes, Container, dependencyLoader, DrawableSprite, EasingFunction, FastRoundedBox, FillMode, lerp, resolved, RoundedBox } from 'osucad-framework';
import { OsucadSpriteText } from '../OsucadSpriteText';
import { BeatmapCarousel } from './BeatmapCarousel';
import { CarouselLoadQueue } from './CarouselLoadQueue';
import { CarouselMapset } from './CarouselMapset';
import { DrawableCarouselBeatmap } from './DrawableCarouselBeatmap';
import { DrawableCarouselItem } from './DrawableCarouselItem';

export class DrawableCarouselMapset extends DrawableCarouselItem {
  static HEIGHT = 80;

  constructor(item?: CarouselMapset) {
    super(item);

    this.add(this.#beatmapContainer = new Container({
      relativeSizeAxes: Axes.Both,
      x: 100,
      padding: { top: DrawableCarouselMapset.HEIGHT },
    }));

    this.header.add(
      new Container({
        relativeSizeAxes: Axes.Both,
        padding: { horizontal: 20, vertical: 6 },
        children: [
          this.title = new OsucadSpriteText({
            fontSize: 18,
          }),
          this.artist = new OsucadSpriteText({
            fontSize: 16,
            alpha: 0.8,
            y: 20,
          }),
          this.creatorInfo = this.createCreatorInfo().with({
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

  readonly title: OsucadSpriteText;

  readonly artist: OsucadSpriteText;

  protected prepareForUse() {
    super.prepareForUse();

    for (const beatmap of this.carouselMapset.beatmaps) {
      beatmap.visible.valueChanged.addListener(this.#scheduleUpdateBeatmapYPositions, this);
    }

    this.title.text = this.mapset.title;
    this.artist.text = this.mapset.artist;
    this.creatorInfo.text = this.mapset.authorName;

    this.header.addAll(
      this.#background = new MapsetBackground(this.mapset).with({ depth: 1 }),
    );

    this.carouselMapset.invalidated.addListener(this.#onMapsetInvalidated, this);
  }

  #scheduleUpdateBeatmapYPositions() {
    this.scheduler.addOnce(this.updateBeatmapYPositions, this);
  }

  protected freeAfterUse() {
    super.freeAfterUse();

    for (const beatmap of this.carouselMapset.beatmaps) {
      beatmap.visible.valueChanged.removeListener(this.#scheduleUpdateBeatmapYPositions);
    }

    this.#beatmapContainer.clear();

    this.header.remove(this.#background);

    this.beatmapsCreated = false;

    this.carouselMapset.invalidated.removeListener(this.#onMapsetInvalidated, this);
  }

  #onMapsetInvalidated() {
    if (this.beatmapsCreated) {
      const children = [...this.beatmaps];

      let anyAdded = false;

      const shouldRemove = new Set(children.map(it => it.carouselBeatmap));

      for (const beatmap of this.carouselMapset.beatmaps) {
        const exists = children.some(it => it.carouselBeatmap === beatmap);
        if (!exists) {
          this.#beatmapContainer.add(
            new DrawableCarouselBeatmap(beatmap),
          );
          anyAdded = true;
        }
        shouldRemove.delete(beatmap);
      }

      for (const beatmap of shouldRemove) {
        const drawable = children.find(it => it.carouselBeatmap === beatmap);
        if (drawable)
          this.#beatmapContainer.remove(drawable);
      }

      if (anyAdded)
        this.updateBeatmapYPositions();
    }
  }

  #beatmapContainer!: Container<DrawableCarouselBeatmap>;

  #background!: MapsetBackground;

  get carouselMapset() {
    return this.item as CarouselMapset;
  }

  get mapset() {
    return this.carouselMapset.mapset;
  }

  creatorInfo!: OsucadSpriteText;

  protected selected() {
    super.selected();

    this.movementContainer.moveToX(-100, 500, EasingFunction.OutQuart);

    if (!this.beatmapsCreated) {
      this.beatmapsCreated = true;
      this.#beatmapContainer.clear();
      this.#beatmapContainer.addAll(
        ...this.carouselMapset.beatmaps
          .map(item => new DrawableCarouselBeatmap(item)),
      );
    }

    this.updateBeatmapYPositions();
  }

  protected deselected() {
    super.deselected();

    this.movementContainer.moveToX(0, 500, EasingFunction.OutQuart);

    this.updateBeatmapYPositions();

    this.beatmaps.forEach(it => it.fadeOut(100).expire());
    this.beatmapsCreated = false;
  }

  createCreatorInfo() {
    return new OsucadSpriteText({
      fontSize: 16,
      alpha: 0.8,
    });
  }

  update() {
    super.update();

    this.creatorInfo.x = -this.header.x - this.movementContainer.x;

    const targetY = this.item.carouselYPosition;

    if (almostEquals(this.y, targetY, 0.1)) {
      this.y = targetY;
    }
    else {
      this.y = lerp(targetY, this.y, Math.exp(-0.01 * this.time.elapsed));
    }
  }

  updateBeatmapYPositions() {
    let yPos = 5;

    const isSelected = this.item.selected.value;

    for (const child of this.#beatmapContainer.children) {
      const panel = child as DrawableCarouselBeatmap;

      if (!panel.item.visible.value) {
        panel.moveToY(0, 500, EasingFunction.OutQuart);
        panel.fadeOut(100);
        continue;
      }

      panel.fadeIn(400);

      if (isSelected) {
        panel.moveToY(yPos, 500, EasingFunction.OutQuart);
        yPos += panel.item.totalHeight;
      }
      else {
        panel.moveToY(0, 500, EasingFunction.OutQuart);
      }
    }
  }

  get parallax() {
    return this.#background?.parallax ?? 0;
  }

  set parallax(value: number) {
    if (this.#background)
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
  }

  @resolved(CarouselLoadQueue)
  carouselLoadQueue!: CarouselLoadQueue;

  @dependencyLoader()
  load() {
    // scheduling this with 50ms delay to avoid loading too many textures at once when fast-seeking
    this.scheduler.addDelayed(() => this.loadBackground(), 100);

    this.addAllInternal(new FastRoundedBox({
      relativeSizeAxes: Axes.Both,
      cornerRadius: 10,
      color: 0x282832,
    }), this.#content = new Container({
      relativeSizeAxes: Axes.Both,
    }), this.#hoverHighlight = new FastRoundedBox({
      relativeSizeAxes: Axes.Both,
      cornerRadius: 10,
      alpha: 0,
    }));
  }

  #content!: Container;

  get content() {
    return this.#content;
  }

  #hoverHighlight!: FastRoundedBox;

  @resolved(OsucadConfigManager)
  config!: OsucadConfigManager;

  async loadBackground() {
    if (this.config.get(OsucadSettings.SongSelectPreventLoadOnScroll) && this.findClosestParentOfType(BeatmapCarousel)!.isFastSeeking) {
      this.scheduler.addDelayed(() => this.loadBackground(), 50);
      return;
    }

    this.carouselLoadQueue.add({
      load: async () => {
        const texture = await this.mapset.loadThumbnailLarge();
        if (!texture)
          return;

        const source = texture.source as ImageSource;

        const resource = source.resource as ImageBitmap;

        this.onDispose(() => {
          texture.destroy(true);
          resource.close();
        });

        this.carouselLoadQueue.add({
          load: () => {
            const mask = new RoundedBox({
              relativeSizeAxes: Axes.Both,
              cornerRadius: 10,
            });

            const background = this.background = new DrawableSprite({
              relativeSizeAxes: Axes.Both,
              fillMode: FillMode.Fill,
              texture,
              color: 'rgb(168, 168, 168)',
              anchor: Anchor.Center,
              origin: Anchor.Center,
            });

            background.drawNode.mask = mask.drawNode;

            this.addAll(background, mask);
            background.y = this.parallax * this.parallaxMultiplier;

            background.fadeInFromZero(250);
          },
          shouldLoad: () => !this.isDisposed,
        });
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

  onHover(): boolean {
    this.#hoverHighlight.fadeTo(0.1);
    return true;
  }

  onHoverLost(e: HoverLostEvent) {
    this.#hoverHighlight.fadeOut(50);
  }
}
