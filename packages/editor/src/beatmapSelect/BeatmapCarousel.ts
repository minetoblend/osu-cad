import type { StableBeatmapInfo } from 'osucad/src/renderer/src/StableBeatmapStore';
import type {
  KeyDownEvent,
} from 'osucad-framework';
import type { BeatmapItemInfo } from './BeatmapItemInfo';
import type { DrawableCarouselItem } from './DrawableCarouselItem';
import type { MapsetInfo } from './MapsetInfo';
import { binarySearch } from '@osucad/common';
import {
  Action,
  Axes,
  Bindable,
  clamp,
  CompositeDrawable,
  dependencyLoader,
  Direction,
  DrawablePool,
  Invalidation,
  Key,
  LayoutMember,
  lerp,
  resolved,
  ScreenStack,
} from 'osucad-framework';
import { BackdropBlurFilter } from 'pixi-filters';
import { OsucadConfigManager } from '../config/OsucadConfigManager';
import { OsucadSettings } from '../config/OsucadSettings';
import { EditorLoader } from '../editor/EditorLoader';
import { MainScrollContainer } from '../editor/MainScrollContainer';
import { BeatmapStore } from '../environment';
import { EditorEnvironment } from '../environment/EditorEnvironment';
import { UISamples } from '../UISamples';
import { CarouselBeatmap } from './CarouselBeatmap';
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
  constructor() {
    super();

    this.relativeSizeAxes = Axes.Both;

    this.addInternal(this.#scroll = new CarouselScrollContainer());
    this.#scroll.relativeSizeAxes = Axes.Both;

    this.addLayout(this.#itemsCache);
  }

  bleedTop = 0;

  bleedBottom = 0;

  #scroll!: CarouselScrollContainer;

  mapsets: CarouselMapset[] = [];

  #itemsCache = new LayoutMember(Invalidation.DrawSize);

  #visibleItems: CarouselMapset[] = [];

  @resolved(UISamples)
  samples!: UISamples;

  @resolved(OsucadConfigManager)
  config!: OsucadConfigManager;

  #lastScrollPosition = 0;

  @resolved(BeatmapStore)
  beatmapStore!: BeatmapStore;

  get beatmaps() {
    return this.beatmapStore.beatmaps;
  }

  update() {
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
        ? (this.#scroll.current - item.y) / this.drawSize.y
        : 0;

      for (const beatmap of item.beatmaps) {
        this.#updateItem(beatmap, item);
      }
    }

    this.#carouselLoadQueue.loadNext();
  }

  #carouselLoadQueue = new CarouselLoadQueue();

  #parallaxEnabled = new Bindable(false);

  #mapsetPool = new DrawablePool(DrawableCarouselMapset, 10, 50);

  @dependencyLoader()
  load() {
    this.dependencies.provide(this.#carouselLoadQueue);

    this.addInternal(this.#mapsetPool);

    this.config.bindWith(OsucadSettings.SongSelectParallax, this.#parallaxEnabled);

    this.beatmapStore.added.addListener(this.addBeatmap, this);
    this.beatmapStore.removed.addListener(this.removeBeatmap, this);
  }

  protected loadComplete() {
    super.loadComplete();

    this.beatmapsUpdated(this.beatmaps.value);
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

  @resolved(EditorEnvironment)
  environment!: EditorEnvironment;

  beatmapsUpdated(beatmaps: BeatmapItemInfo[]) {
    const mapsets = new Map<string, MapsetInfo>();

    for (const beatmap of beatmaps) {
      if (!mapsets.has(beatmap.setId)) {
        mapsets.set(beatmap.setId, {
          title: beatmap.title,
          artist: beatmap.artist,
          author: beatmap.author,
          authorName: beatmap.authorName,
          beatmaps: [],
          updatedAt: `${beatmap.lastEdited}`,
          loadThumbnailSmall: () => beatmap.loadThumbnailSmall(),
          loadThumbnailLarge: () => beatmap.loadThumbnailLarge(),
          id: `${beatmap.setId}`,
        } as MapsetInfo);
      }

      const mapset = mapsets.get(beatmap.setId)!;

      mapset.beatmaps.push(beatmap);

      beatmap.mapset = mapset;
    }

    this.mapsets = [...mapsets.values()].map(mapset => this.createCarouselMapset(mapset));

    this.mapsets.sort((a, b) => a.mapset.title.localeCompare(b.mapset.title));

    this.#itemsCache.invalidate();

    this.selectRandomBeatmap();
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

  selectionChanged = new Action<BeatmapItemInfo>();

  createCarouselMapset(mapset: MapsetInfo) {
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
          this.#scrollTarget = currentY + CarouselMapset.HEIGHT - this.#visibleHalfHeight + this.bleedTop;
        }

        continue;
      }

      this.#visibleItems.push(set);
      set.carouselYPosition = currentY;

      if (set.selected.value) {
        this.#scrollTarget = set.carouselYPosition + CarouselMapset.HEIGHT - this.#visibleHalfHeight + this.bleedTop;

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

  onKeyDown(e: KeyDownEvent): boolean {
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
          this.findClosestParentOfType(ScreenStack)?.push(new EditorLoader(beatmap.beatmapInfo));
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

  addMapset(mapset: MapsetInfo, select = true) {
    const carouselMapset = this.createCarouselMapset(mapset);

    this.mapsets.push(carouselMapset);
    this.mapsets.sort((a, b) => a.mapset.title.localeCompare(b.mapset.title));

    this.#itemsCache.invalidate();

    if (select) {
      if (carouselMapset.beatmaps[0]) {
        carouselMapset.beatmaps[0].selected.value = true;
      }
    }
  }

  addBeatmap(beatmap: BeatmapItemInfo) {
    const mapset = this.mapsets.find(it => it.mapset.id === beatmap.setId);

    if (mapset) {
      const carouselBeatmap = new CarouselBeatmap(beatmap);
      mapset.beatmaps.push(carouselBeatmap);
      mapset.invalidated.emit();
      this.#itemsCache.invalidate();
    }
    else {
      this.addMapset({
        id: beatmap.setId,
        beatmaps: [beatmap],
        authorName: beatmap.authorName,
        artist: beatmap.artist,
        author: beatmap.author,
        title: beatmap.title,
        loadThumbnailLarge: () => beatmap.loadThumbnailLarge(),
        loadThumbnailSmall: () => beatmap.loadThumbnailSmall(),
      }, this.mapsets.length === 0);
    }
  }

  removeBeatmap(beatmap: StableBeatmapInfo) {
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

  #mouseWasInside = false;

  updateAfterChildren() {
    super.updateAfterChildren();

    const mouseIsInside = this.contains(this.getContainingInputManager()!.currentState.mouse.position);

    if (!mouseIsInside && this.#mouseWasInside) {
      this.#scrollToSelected();
    }

    this.#mouseWasInside = mouseIsInside;
  }

  override dispose(isDisposing: boolean = true) {
    super.dispose(isDisposing);

    this.beatmapStore.added.removeListener(this.addBeatmap, this);
  }
}

class CarouselScrollContainer extends MainScrollContainer<DrawableCarouselMapset> {
  constructor() {
    super(Direction.Vertical);

    // eslint-disable-next-line dot-notation
    this.scrollContent['autoSizeAxes'] = Axes.None;

    this.rightClickScroll = true;

    const filter = new BackdropBlurFilter({
      strength: 15,
      antialias: 'inherit',
      quality: 3,
      resolution: devicePixelRatio,
    });

    filter.padding = 30;

    this.scrollContent.filters = [filter];

    this.masking = false;
  }

  receivePositionalInputAt(): boolean {
    return true;
  }
}
