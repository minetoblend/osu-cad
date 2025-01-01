import type {
  HoverEvent,
  HoverLostEvent,
  ReadonlyDependencyContainer,
} from 'osucad-framework';
import { UISamples } from '@osucad/editor/UISamples';
import {
  Anchor,
  Axes,
  Container,
  EasingFunction,
  FastRoundedBox,
  FillFlowContainer,
  lerp,
  resolved,
  RoundedBox,
  Vec2,
} from 'osucad-framework';
import { Color } from 'pixi.js';
import { OsucadSpriteText } from '../../drawables/OsucadSpriteText';
import { CarouselBeatmap } from './CarouselBeatmap';
import { DrawableCarouselItem } from './DrawableCarouselItem';

export class DrawableCarouselBeatmap extends DrawableCarouselItem {
  constructor(item: CarouselBeatmap) {
    super(item);

    let lastEditedText = '';

    this.alpha = 0;

    // for sorting
    this.depth = -item.beatmapInfo.starRating;

    if (item.beatmapInfo.lastEdited) {
      const formatted = item.beatmapInfo.lastEdited.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: item.beatmapInfo.lastEdited.getFullYear() !== new Date().getFullYear()
          ? 'numeric'
          : undefined,
      });

      lastEditedText = `Last edited ${formatted}`;
    }

    this.header.addAll(
      this.#background = new RoundedBox({
        relativeSizeAxes: Axes.Both,
        fillColor: 0x282832,
        cornerRadius: 10,
        alpha: 0.9,
      }),
      this.#hoverHighlight = new FastRoundedBox({
        relativeSizeAxes: Axes.Both,
        cornerRadius: 10,
        alpha: 0,
        depth: -1000,
      }),
    );

    this.scheduler.addDelayed(() => {
      this.header.addAll(
        this.#lastEdited = new OsucadSpriteText({
          text: lastEditedText,
          anchor: Anchor.CenterRight,
          origin: Anchor.CenterRight,
          color: 0xB6B6C3,
          fontSize: 14,
        }),
        new FillFlowContainer({
          padding: { horizontal: 20, vertical: 6 },
          relativeSizeAxes: Axes.Both,
          spacing: new Vec2(8),
          children: [
            new Container({
              autoSizeAxes: Axes.Both,
              anchor: Anchor.CenterLeft,
              origin: Anchor.CenterLeft,
              children: [
                this.#starRatingBackground = new FastRoundedBox({
                  relativeSizeAxes: Axes.Both,
                  color: this.getDifficultyColor(),
                  cornerRadius: 4,
                  alpha: 0.9,
                }),
                new FillFlowContainer({
                  autoSizeAxes: Axes.Both,
                  padding: { horizontal: 4, vertical: 1 },
                  spacing: new Vec2(4),
                  children: [
                    this.#starRatingText = new OsucadSpriteText({
                      text: this.carouselBeatmap.beatmapInfo.starRating.toFixed(2),
                      anchor: Anchor.CenterLeft,
                      origin: Anchor.CenterLeft,
                    }),
                  ],
                }),
              ],
            }),
            this.#difficultyName = new OsucadSpriteText({
              text: this.carouselBeatmap.beatmapInfo.difficultyName,
              anchor: Anchor.CenterLeft,
              origin: Anchor.CenterLeft,
            }),
          ],
        }),
      );
    }, 50);
  }

  #lastEdited!: OsucadSpriteText;

  #hoverHighlight!: FastRoundedBox;

  #difficultyName!: OsucadSpriteText;

  #starRatingText!: OsucadSpriteText;

  #starRatingBackground!: FastRoundedBox;

  getDifficultyColor() {
    const stops: [number, Color][] = [
      [0.1, new Color('aaaaaa')],
      [0.1, new Color('4290fb')],
      [1.25, new Color('4fc0ff')],
      [2.0, new Color('4fffd5')],
      [2.5, new Color('7cff4f')],
      [3.3, new Color('f6f05c')],
      [4.2, new Color('ff8068')],
      [4.9, new Color('ff4e6f')],
      [5.8, new Color('c645b8')],
      [6.7, new Color('6563de')],
      [7.7, new Color('18158e')],
      [9.0, new Color('black')],
    ];

    const difficulty = this.carouselBeatmap.beatmapInfo.starRating;

    for (let i = 1; i < stops.length; i++) {
      if (difficulty < stops[i][0]) {
        const [prev, next] = [stops[i - 1], stops[i]];

        const t = (difficulty - prev[0]) / (next[0] - prev[0]);

        if (!prev || !next) {
          break;
        }

        const a = prev[1].toRgb();
        const b = next[1].toRgb();
        return new Color({
          r: lerp(a.r, b.r, t) * 255,
          g: lerp(a.g, b.g, t) * 255,
          b: lerp(a.b, b.b, t) * 255,
        }).toNumber();
      }
    }

    return 0x000000;
  }

  get carouselBeatmap() {
    return this.item as CarouselBeatmap;
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.header.height = CarouselBeatmap.HEIGHT;
  }

  #background!: RoundedBox;

  override selected() {
    super.selected();

    this.#background.outlines = [{
      width: 2,
      color: this.getDifficultyColor(),
      alpha: 1,
      alignment: 0,
    }];

    this.movementContainer.moveToX(
      -50,
      500,
      EasingFunction.OutExpo,
    );

    this.header.filters = [];
  }

  override deselected() {
    super.deselected();

    this.#background.outlines = [];

    this.movementContainer.moveToX(0, 500, EasingFunction.OutExpo);

    this.header.filters = [];
  }

  @resolved(UISamples)
  samples!: UISamples;

  override onClick(): boolean {
    if (this.item.selected.value) {
      this.samples.menuhit.play();
      this.carouselBeatmap.beatmapInfo.select();
    }

    return super.onClick();
  }

  override update() {
    super.update();

    if (this.#lastEdited)
      this.#lastEdited.x = -this.header.x - this.movementContainer.x - 20;
  }

  override onHover(e: HoverEvent): boolean {
    this.#hoverHighlight.fadeTo(0.1).fadeTo(0.05, 300, EasingFunction.OutExpo);

    return true;
  }

  override onHoverLost(e: HoverLostEvent) {
    this.#hoverHighlight.fadeOut();
  }
}
