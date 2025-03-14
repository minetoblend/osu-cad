import type { KeyDownEvent, ReadonlyDependencyContainer } from '@osucad/framework';
import type { CarouselBeatmap } from './CarouselBeatmap';
import type { CarouselBeatmapInfo } from './CarouselBeatmapInfo';
import type { CarouselBeatmapSetInfo } from './CarouselBeatmapSetInfo';
import type { DrawableCarouselItem } from './DrawableCarouselItem';
import { Action, Axes, BetterBackdropBlurFilter, Bindable, clamp, CompositeDrawable, Direction, DrawablePool, Invalidation, Key, LayoutMember, lerp, provide, resolved } from '@osucad/framework';
import { OsucadConfigManager } from '../../config/OsucadConfigManager';
import { OsucadSettings } from '../../config/OsucadSettings';
import { OsucadScrollContainer } from '../../drawables/OsucadScrollContainer';
import { UISamples } from '../../UISamples';
import { binarySearch } from '../../utils/binarySearch';
import { CarouselLoadQueue } from './CarouselLoadQueue';
import { CarouselMapset } from './CarouselMapset';
import { DrawableCarouselMapset } from './DrawableCarouselMapset';

const distance_offscreen_before_unload = 1024;

const distance_offscreen_to_preload = 512;

enum PendingScrollOperation {
  None,
  Standard,
  Immediate,
}

export class BeatmapCarousel extends CompositeDrawable {
  constructor(readonly beatmaps: Bindable<CarouselBeatmapSetInfo[]>) {
    super();

    this.relativeSizeAxes = Axes.Both;

    this.addInternal(this.#scroll = new CarouselScrollContainer());
    this.#scroll.relativeSizeAxes = Axes.Both;

    this.addLayout(this.#itemsCache);
  }

  bleedTop = 0;

  bleedBottom = 0;

  scrollOffset = 0;

  #scroll!: CarouselScrollContainer;

  mapsets: CarouselMapset[] = [];

  #itemsCache = new LayoutMember(Invalidation.DrawSize);

  #visibleItems: CarouselMapset[] = [];

  @resolved(UISamples)
  samples!: UISamples;

  @resolved(OsucadConfigManager)
  config!: OsucadConfigManager;

  #lastScrollPosition = 0;

  override update() {
    super.update();

    const scrollDelta = this.#scroll.current - this.#lastScrollPosition;

    // averaging the scroll delta to avoid jittering
    this.#scrollDelta = lerp(this.#scrollDelta, scrollDelta, Math.min(this.time.elapsed * 0.015, 1));
    this.#lastScrollPosition = this.#scroll.current;

    const revalidateItems = !this.#itemsCache.isValid;

    if (revalidateItems) {
      this.#updateYPositions();
    }

    if (this.#pendingScrollOperation !== PendingScrollOperation.None) {
      this.#updateScrollPosition();
    }

    if (!this.#selectedBeatmapSet && this.#visibleItems.length > 0) {
      this.#visibleItems[0].beatmaps[0].selected.value = true;
      this.#scrollToSelected(false);
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

      for (const panel of this.#scroll.children) {
        if (toDisplay.delete(panel.item as CarouselMapset)) {
          continue;
        }

        if (panel.y + this.#visibleUpperBound - distance_offscreen_before_unload || panel.y > this.#visibleBottomBound + distance_offscreen_before_unload) {
          panel.clearTransforms();
          panel.expire();
        }
      }

      for (const item of toDisplay) {
        const panel = this.#mapsetPool.get(it => it.item = item);
        panel.drawNode.zIndex = item.carouselYPosition;
        panel.y = item.carouselYPosition;
        panel.fadeTo(0.75).fadeIn(200);

        this.#scroll.add(panel);
      }
    }

    for (const item of this.#scroll.children) {
      this.#updateItem(item);

      item.parallax = this.#parallaxEnabled.value
        ? (this.#scroll.current - (item.y + item.drawHeight / 2)) / this.drawHeight + 0.5
        : 0;

      for (const beatmap of item.beatmaps) {
        this.#updateItem(beatmap, item);
      }
    }

    this.carouselLoadQueue.loadNext();
  }

  @provide()
  readonly carouselLoadQueue = new CarouselLoadQueue();

  #parallaxEnabled = new Bindable(false);

  #mapsetPool = new DrawablePool(DrawableCarouselMapset, 10, 50);

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.addInternal(this.#mapsetPool);
    this.config.bindWith(OsucadSettings.SongSelectParallax, this.#parallaxEnabled);
  }

  protected override loadComplete() {
    super.loadComplete();

    this.beatmaps.addOnChangeListener(evt => this.beatmapsUpdated(evt.value), { immediate: true });
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

  beatmapsUpdated(mapsets: CarouselBeatmapSetInfo[]) {
    this.mapsets = mapsets.map(mapset => this.createCarouselMapset(mapset));

    this.mapsets.sort((a, b) => a.mapset.title.localeCompare(b.mapset.title));

    this.#itemsCache.invalidate();

    this.selectFirstBeatmap();
  }

  applyFilter(ids: Set<string> | null) {
    if (ids === null) {
      for (const mapset of this.mapsets) {
        mapset.visible.value = true;
        for (const beatmap of mapset.beatmaps)
          beatmap.visible.value = true;
      }
    }
    else {
      for (const mapset of this.mapsets) {
        let anyVisible = false;
        for (const beatmap of mapset.beatmaps) {
          beatmap.visible.value = ids.has(beatmap.beatmapInfo.id);
          anyVisible ||= beatmap.visible.value;
        }

        mapset.visible.value = anyVisible;
      }
    }

    this.#itemsCache.invalidate();
    this.#scrollToSelected(!!this.#selectedBeatmapSet?.visible.value);
  }

  #selectedBeatmapSet?: CarouselMapset;

  selectionChanged = new Action<CarouselBeatmapInfo>();

  createCarouselMapset(mapset: CarouselBeatmapSetInfo) {
    const carouselMapset = new CarouselMapset(mapset);

    for (const beatmap of carouselMapset.beatmaps) {
      beatmap.selected.addOnChangeListener(({ value: selected }) => {
        this.#onSelected(carouselMapset, beatmap, selected);
      });
    }

    return carouselMapset;
  }

  #onSelected(mapset: CarouselMapset, beatmap: CarouselBeatmap, selected: boolean) {
    if (selected) {
      this.#selectedBeatmapSet = mapset;
      this.selectionChanged.emit(beatmap.beatmapInfo);
      this.#itemsCache.invalidate();

      for (const b of this.mapsets) {
        if (b === mapset)
          continue;

        b.selected.value = false;
        this.#scrollToSelected();
      }

      this.samples.keyMovement.play();
    }
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
      if (!set.visible.value) {
        if (set.selected.value) {
          this.#scrollTarget = currentY + CarouselMapset.HEIGHT - this.#visibleHalfHeight + this.bleedTop + this.scrollOffset + this.scrollOffset;
        }

        continue;
      }

      this.#visibleItems.push(set);
      set.carouselYPosition = currentY;

      if (set.selected.value) {
        this.#scrollTarget = set.carouselYPosition + CarouselMapset.HEIGHT - this.#visibleHalfHeight + this.bleedTop + this.scrollOffset;

        for (const b of set.beatmaps) {
          if (!b.visible.value)
            continue;

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

  #firstScroll = true;

  entryAnimation() {
    this.#firstScroll = true;
    this.#scrollTarget = this.#scroll.current;
    this.#pendingScrollOperation = PendingScrollOperation.Standard;
  }

  override onKeyDown(e: KeyDownEvent): boolean {
    switch (e.key) {
      case Key.F2: {
        if (e.repeat)
          return false;

        this.selectRandomBeatmap();
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
      case Key.Enter: {
        if (e.repeat)
          return false;

        const beatmap = this.#selectedBeatmapSet?.beatmaps.find(it => it.selected.value);
        if (beatmap) {
          beatmap.beatmapInfo.select();
        }

        return true;
      }
    }

    return false;
  }

  seek(direction: number, skipDifficulties = false) {
    const index = this.#selectedBeatmapSet?.beatmaps.findIndex(it => it.selected.value);

    if (index === undefined || index === -1) {
      return;
    }

    if (this.#selectedBeatmapSet && !skipDifficulties) {
      let nextIndex = index + direction;

      while (this.#selectedBeatmapSet.beatmaps[nextIndex]) {
        const beatmap = this.#selectedBeatmapSet.beatmaps[nextIndex];

        if (beatmap.visible.value) {
          beatmap.selected.value = true;
          return;
        }

        nextIndex += direction;
      }

      skipDifficulties = true;
    }

    if (!this.#selectedBeatmapSet?.beatmaps[index + direction] || skipDifficulties) {
      let mapsetIndex = this.mapsets.findIndex(it => it === this.#selectedBeatmapSet);

      while (this.mapsets[mapsetIndex + direction]) {
        const mapset = this.mapsets[mapsetIndex + direction];

        if (mapset.visible.value) {
          const beatmap
            = direction > 0
              ? mapset.beatmaps.find(it => it.visible.value)
              : mapset.beatmaps.findLast(it => it.visible.value);

          if (beatmap) {
            beatmap.selected.value = true;
            return;
          }
        }

        mapsetIndex += direction;
      }

      return;
    }

    this.#selectedBeatmapSet.beatmaps[index + direction].selected.value = true;
  }

  selectRandomBeatmap() {
    const beatmaps = this.mapsets.flatMap(it => it.beatmaps).filter(it => it.visible.value);
    if (beatmaps.length === 0)
      return;

    beatmaps[Math.floor(Math.random() * beatmaps.length)].selected.value = true;
  }

  selectFirstBeatmap() {
    const beatmaps = this.mapsets.flatMap(it => it.beatmaps).filter(it => it.visible.value);
    if (beatmaps.length === 0)
      return;

    beatmaps[0].selected.value = true;
  }

  removeBeatmap(beatmap: CarouselBeatmapInfo) {
    const mapset = this.mapsets.find(it => it.mapset.id === beatmap.setId);
    if (!mapset)
      return;

    mapset.removeBeatmap(beatmap);
  }

  #scrollDelta = 0;

  get isFastSeeking() {
    const scrollSpeed = Math.abs(this.#scrollDelta) / this.time.elapsed;

    return scrollSpeed > 1;
  }
}

class CarouselScrollContainer extends OsucadScrollContainer<DrawableCarouselMapset> {
  constructor() {
    super(Direction.Vertical);

    // eslint-disable-next-line dot-notation
    this.scrollContent['autoSizeAxes'] = Axes.None;

    this.rightClickScroll = true;

    const filter = new BetterBackdropBlurFilter({
      strength: 15,
      antialias: 'inherit',
      quality: 3,
      resolution: devicePixelRatio,
    });

    filter.padding = 30;

    this.scrollContent.filters = [filter];

    this.masking = false;
  }

  override receivePositionalInputAt(): boolean {
    return true;
  }
}
