import {
  Action,
  Axes,
  CompositeDrawable,
  Direction,
  Invalidation,
  LayoutMember,
  dependencyLoader,
} from 'osucad-framework';
import type { MapsetBeatmapInfo, MapsetInfo } from '@osucad/common';
import { binarySearch } from '@osucad/common';
import gsap from 'gsap';
import { BackdropBlurFilter } from 'pixi-filters';
import { MainScrollContainer } from '../editor/MainScrollContainer';
import { CarouselMapset } from './CarouselMapset';
import type { DrawableCarouselItem } from './DrawableCarouselItem';
import { DrawableCarouselMapset } from './DrawableCarouselMapset';

const distance_offscreen_before_unload = 2048;

const distance_offscreen_to_preload = 768;

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
    this.schedule(() => this.#loadMapsets());
  }

  #scroll!: CarouselScrollContainer;

  mapsets: CarouselMapset[] = [];

  #itemsCache = new LayoutMember(Invalidation.DrawSize);

  #visibleItems: CarouselMapset[] = [];

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

    // item.header.multiplicativeAlpha = clamp(1.75 - 1.5 * dist, 0, 1);
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

  async #loadMapsets() {
    const response = await fetch('/api/mapsets/own', {
      method: 'GET',
      priority: 'high',
      credentials: 'same-origin',
    });

    if (!response.ok) {
      console.error('Failed to load mapsets');
      return;
    }

    const mapsets = await response.json() as MapsetInfo[];

    this.mapsets = mapsets.map(mapset => this.createCarouselMapset(mapset));

    this.#itemsCache.invalidate();

    if (mapsets.length > 0) {
      this.mapsets[
        Math.floor(Math.random() * mapsets.length)
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
    const circleRadius = 3;
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
    console.log('disposing BeatmapCarousel');

    return super.dispose();
  }

  #firstScroll = true;

  entryAnimation() {
    this.#firstScroll = true;
    this.#scrollTarget = this.#scroll.current;
    this.#pendingScrollOperation = PendingScrollOperation.Standard;
  }
}

class CarouselScrollContainer extends MainScrollContainer {
  constructor() {
    super(Direction.Vertical);

    // eslint-disable-next-line dot-notation
    this.scrollContent['autoSizeAxes'] = Axes.None;

    const filter = new BackdropBlurFilter({
      strength: 10,
      antialias: 'on',
      quality: 3,
      resolution: devicePixelRatio,
    });

    filter.padding = 30;

    this.scrollContent.filters = [filter];

    this.masking = false;
  }
}
