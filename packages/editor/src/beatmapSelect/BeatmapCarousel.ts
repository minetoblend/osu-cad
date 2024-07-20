import type { KeyDownEvent } from 'osucad-framework';
import { Action, Axes, CompositeDrawable, Direction, Invalidation, Key, LayoutMember, clamp, dependencyLoader, resolved } from 'osucad-framework';
import type { BeatmapInfo, MapsetBeatmapInfo, MapsetInfo } from '@osucad/common';
import { binarySearch } from '@osucad/common';
import gsap from 'gsap';
import { BackdropBlurFilter } from 'pixi-filters';
import { MainScrollContainer } from '../editor/MainScrollContainer';
import { UISamples } from '../UISamples';
import { CarouselMapset } from './CarouselMapset';
import type { DrawableCarouselItem } from './DrawableCarouselItem';
import { DrawableCarouselMapset } from './DrawableCarouselMapset';

const distance_offscreen_before_unload = 512;

const distance_offscreen_to_preload = 256;

enum PendingScrollOperation {
  None,
  Standard,
  Immediate,
}

export class BeatmapCarousel extends CompositeDrawable {
  constructor() {
    super();

    this.relativeSizeAxes = Axes.Both;

    this.addInternal(this.#scroll = new CarouselScrollContainer());
    this.#scroll.relativeSizeAxes = Axes.Both;

    this.addLayout(this.#itemsCache);
  }

  bleedTop = 0;

  bleedBottom = 0;

  @dependencyLoader()
  load() {
    this.schedule(() => this.loadMapsets());
  }

  #scroll!: CarouselScrollContainer;

  mapsets: CarouselMapset[] = [];

  #itemsCache = new LayoutMember(Invalidation.DrawSize);

  #visibleItems: CarouselMapset[] = [];

  @resolved(UISamples)
  samples!: UISamples;

  update() {
    super.update();

    const revalidateItems = !this.#itemsCache.isValid;

    if (revalidateItems) {
      this.#updateYPositions();
    }

    if (this.#pendingScrollOperation !== PendingScrollOperation.None) {
      this.#updateScrollPosition();
    }

    const newDisplayRange = this.#getDisplayRange();

    if (revalidateItems || this.#displayRange.startIndex !== newDisplayRange.startIndex || this.#displayRange.endIndex !== newDisplayRange.endIndex) {
      this.#displayRange = newDisplayRange;

      const toDisplay = new Set(
        this.#visibleItems.slice(
          this.#displayRange.startIndex,
          this.#displayRange.endIndex + 1,
        ),
      );

      for (const child of this.#scroll.children) {
        const panel = child as DrawableCarouselItem;

        if (toDisplay.delete(panel.item as CarouselMapset)) {
          continue;
        }

        if (panel.y + this.#visibleUpperBound - distance_offscreen_before_unload || panel.y > this.#visibleBottomBound + distance_offscreen_before_unload) {
          gsap.killTweensOf(panel);
          panel.expire();
        }
      }

      for (const item of toDisplay) {
        const panel = new DrawableCarouselMapset(item);
        panel.drawNode.zIndex = item.carouselYPosition;
        panel.y = item.carouselYPosition;

        this.#scroll.add(panel);
      }
    }

    for (const child of this.#scroll.children) {
      const item = child as DrawableCarouselMapset;

      this.#updateItem(item);

      for (const beatmap of item.beatmaps) {
        this.#updateItem(beatmap, item);
      }
    }
  }

  #updateItem(item: DrawableCarouselItem, parent?: DrawableCarouselItem) {
    const itemDrawY = item.y + (parent?.y ?? 0) - this.#scroll.current;
    const dist = Math.abs(1 - itemDrawY / this.#visibleHalfHeight);

    item.header.x = this.#offsetX(dist, this.#visibleHalfHeight) - (parent?.x ?? 0);

    item.header.alpha = clamp(2 - 1.5 * dist, 0, 1);
  }

  #displayRange = { startIndex: -1, endIndex: -1 };

  #updateScrollPosition() {
    if (this.#scrollTarget !== null) {
      if (this.#firstScroll) {
        this.#scroll.scrollTo(this.#scrollTarget - 400, false);
        this.#firstScroll = false;
      }

      if (this.#pendingScrollOperation === PendingScrollOperation.Standard) {
        this.#scroll.scrollTo(this.#scrollTarget);
      }
      else if (this.#pendingScrollOperation === PendingScrollOperation.Immediate) {
        const scrollChange = this.#scrollTarget - this.#scroll.current;
        this.#scroll.scrollTo(this.#scrollTarget, false);
        for (const i of this.#scroll.children)
          i.y += scrollChange;
      }
    }
    this.#pendingScrollOperation = PendingScrollOperation.None;
  }

  async loadMapsets() {
    const response = await fetch('/api/beatmaps?sort=recent&filter=own', {
      method: 'GET',
      priority: 'high',
      credentials: 'same-origin',
    });

    if (!response.ok) {
      console.error('Failed to load mapsets');
      return;
    }

    const beatmaps = await response.json() as BeatmapInfo[];

    const map = new Map<string, MapsetInfo>();

    for (const beatmap of beatmaps) {
      if (!map.has(beatmap.setId)) {
        map.set(beatmap.setId, {
          title: beatmap.title,
          artist: beatmap.artist,
          creator: beatmap.creator,
          beatmaps: [],
          updatedAt: `${beatmap.lastEdited}`,
          links: {
            thumbnailSmall: beatmap.links.thumbnailSmall,
            thumbnailLarge: beatmap.links.thumbnailLarge,
            self: '',
          },
          id: `${beatmap.setId}`,
          tags: [],
          createdAt: '',
        } as MapsetInfo);
      }

      const mapset = map.get(beatmap.setId)!;

      mapset.beatmaps.push({
        id: beatmap.id,
        name: beatmap.version,
        creator: beatmap.creator,
        starRating: beatmap.starRating,
        lastEdited: `${beatmap.lastEdited}`,
        links: {
          edit: beatmap.links.edit,
          audioUrl: beatmap.links.audioUrl,
          thumbnailLarge: beatmap.links.thumbnailLarge,
          thumbnailSmall: beatmap.links.thumbnailSmall,
          self: beatmap.links.view,
        },
      });
    }

    this.mapsets = [...map.values()].map(mapset => this.createCarouselMapset(mapset));

    this.#itemsCache.invalidate();

    if (this.mapsets.length > 0) {
      this.mapsets[
        Math.floor(Math.random() * this.mapsets.length)
      ].selected.value = true;
    }
  }

  #selectedBeatmapSet?: CarouselMapset;

  selectionChanged = new Action<MapsetBeatmapInfo>();

  createCarouselMapset(mapset: MapsetInfo) {
    const set = new CarouselMapset(mapset);

    for (const beatmap of set.beatmaps) {
      beatmap.selected.addOnChangeListener((selected) => {
        if (selected) {
          this.#selectedBeatmapSet = set;
          this.selectionChanged.emit(beatmap.beatmapInfo);
          this.#itemsCache.invalidate();

          for (const b of this.mapsets) {
            if (b === set)
              continue;

            b.selected.value = false;
            this.#scrollToSelected();
          }

          this.samples.keyMovement.play();
        }
      });
    }

    return set;
  }

  #scrollToSelected(immediate = false) {
    this.#pendingScrollOperation = immediate
      ? PendingScrollOperation.Immediate
      : PendingScrollOperation.Standard;
  }

  #pendingScrollOperation = PendingScrollOperation.None;

  #scrollTarget: number | null = null;

  #updateYPositions() {
    this.#visibleItems.length = 0;

    let currentY = this.#visibleHalfHeight;

    this.#scrollTarget = null;

    for (const set of this.mapsets) {
      this.#visibleItems.push(set);
      set.carouselYPosition = currentY;

      if (set.selected.value) {
        this.#scrollTarget = set.carouselYPosition + CarouselMapset.HEIGHT - this.#visibleHalfHeight + this.bleedTop;

        for (const b of set.beatmaps) {
          if (b.selected.value) {
            this.#scrollTarget += b.totalHeight / 2;
            break;
          }

          this.#scrollTarget += b.totalHeight;
        }
      }

      currentY += set.totalHeight + 5;
    }

    currentY += this.#visibleHalfHeight;

    this.#scroll.scrollContent.height = currentY;

    this.#itemsCache.validate();
  }

  #getDisplayRange() {
    const topPosition = this.#visibleUpperBound - distance_offscreen_to_preload;

    const { index: startIndex } = binarySearch(
      topPosition,
      this.#visibleItems,
      item => item.carouselYPosition,
    );

    const bottomPosition = this.#visibleBottomBound + distance_offscreen_to_preload;

    const { index: endIndex } = binarySearch(
      bottomPosition,
      this.#visibleItems,
      item => item.carouselYPosition + item.totalHeight,
    );

    return {
      startIndex: Math.max(startIndex - 1, 0),
      endIndex: Math.min(endIndex + 1, this.#visibleItems.length - 1),
    };
  }

  #offsetX(dist: number, halfHeight: number) {
    // The radius of the circle the carousel moves on.
    const circleRadius = 4;
    const discriminant = Math.max(0, circleRadius * circleRadius - dist * dist);
    const x = (circleRadius - Math.sqrt(discriminant)) * halfHeight;

    return 125 + x;
  }

  get #visibleHalfHeight() {
    return (this.drawSize.y + this.bleedBottom + this.bleedTop) / 2;
  }

  get #visibleBottomBound() {
    return this.#scroll.current + this.drawSize.y + this.bleedBottom;
  }

  get #visibleUpperBound() {
    return this.#scroll.current - this.bleedTop;
  }

  dispose(): boolean {
    return super.dispose();
  }

  #firstScroll = true;

  entryAnimation() {
    this.#firstScroll = true;
    this.#scrollTarget = this.#scroll.current;
    this.#pendingScrollOperation = PendingScrollOperation.Standard;
  }

  onKeyDown(e: KeyDownEvent): boolean {
    switch (e.key) {
      case Key.F2:
      {
        const beatmaps = this.mapsets.flatMap(it => it.beatmaps);

        beatmaps[Math.floor(Math.random() * beatmaps.length)].selected.value = true;

        return true;
      }
      case Key.ArrowUp:
        this.seek(-1);
        return true;
      case Key.ArrowDown:
        this.seek(1);
        return true;
      case Key.ArrowLeft:
        this.seek(-1, true);
        return true;
      case Key.ArrowRight:
        this.seek(1, true);
        return true;
    }

    return false;
  }

  seek(direction: number, skipDifficulties = false) {
    const index = this.#selectedBeatmapSet?.beatmaps.findIndex(it => it.selected.value);

    if (index === undefined || index === -1) {
      return;
    }

    if (!this.#selectedBeatmapSet?.beatmaps[index + direction] || skipDifficulties) {
      const mapsetIndex = this.mapsets.findIndex(it => it === this.#selectedBeatmapSet);

      if (direction === 1) {
        if (this.mapsets[mapsetIndex + 1]) {
          this.mapsets[mapsetIndex + 1].beatmaps[0].selected.value = true;
        }
      }
      else {
        if (this.mapsets[mapsetIndex - 1]) {
          this.mapsets[mapsetIndex - 1].beatmaps[this.mapsets[mapsetIndex - 1].beatmaps.length - 1].selected.value = true;
        }
      }

      return;
    }

    this.#selectedBeatmapSet.beatmaps[index + direction].selected.value = true;
  }
}

class CarouselScrollContainer extends MainScrollContainer {
  constructor() {
    super(Direction.Vertical);

    // eslint-disable-next-line dot-notation
    this.scrollContent['autoSizeAxes'] = Axes.None;

    const filter = new BackdropBlurFilter({
      strength: 10,
      antialias: 'inherit',
      quality: 3,
      resolution: devicePixelRatio,
    });

    filter.padding = 30;

    this.scrollContent.filters = [filter];

    this.masking = false;
  }
}
