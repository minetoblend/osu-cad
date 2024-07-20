import {
  Anchor,
  Axes,
  Container,
  FillFlowContainer,
  RoundedBox,
  ScreenStack,
  Vec2,
  dependencyLoader,
  lerp,
  resolved,
} from 'osucad-framework';
import { Color } from 'pixi.js';
import { OsucadSpriteText } from '../OsucadSpriteText';
import { EditorLoader } from '../editor/EditorLoader';
import { OnlineEditorContext } from '../editor/context/OnlineEditorContext';
import { UISamples } from '../UISamples';
import { DrawableCarouselItem } from './DrawableCarouselItem';
import { CarouselBeatmap } from './CarouselBeatmap';

export class DrawableCarouselBeatmap extends DrawableCarouselItem {
  constructor(item: CarouselBeatmap) {
    super(item);

    let lastEditedText = '';

    if (item.beatmapInfo.lastEdited?.length) {
      const asDate = new Date(item.beatmapInfo.lastEdited);

      const formatted = asDate.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: asDate.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
      });

      lastEditedText = `Last edited ${formatted}`;
    }

    this.header.addAll(
      this.#background = new RoundedBox({
        relativeSizeAxes: Axes.Both,
        fillColor: 0x282832,
        cornerRadius: 10,
        alpha: 0.8,
      }),
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
              new RoundedBox({
                relativeSizeAxes: Axes.Both,
                color: this.getDifficultyColor(),
                cornerRadius: 4,
                alpha: 0.9,
              }),
              new Container({
                autoSizeAxes: Axes.Both,
                padding: { horizontal: 4, vertical: 1 },
                child: new OsucadSpriteText({
                  text: `${this.item.beatmapInfo.starRating.toFixed(2)}`,
                }),
              }),
            ],
          }),
          new OsucadSpriteText({
            text: this.item.beatmapInfo.name,
            anchor: Anchor.CenterLeft,
            origin: Anchor.CenterLeft,
          }),
        ],
      }),
    );
  }

  #lastEdited!: OsucadSpriteText;

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

    const difficulty = this.item.beatmapInfo.starRating;

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

  item!: CarouselBeatmap;

  @dependencyLoader()
  load() {
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

    this.movementContainer.moveTo({
      x: -50,
      duration: 500,
      easing: 'expo.out',
    });

    this.header.filters = [];
  }

  override deselected() {
    super.deselected();

    this.#background.outlines = [];

    this.movementContainer.moveTo({
      x: 0,
      duration: 500,
      easing: 'expo.out',
    });

    this.header.filters = [];
  }

  @resolved(UISamples)
  samples!: UISamples;

  onClick(): boolean {
    if (this.item.selected.value) {
      const joinKey = this.item.beatmapInfo.links.edit.split('/').pop()!;

      this.samples.menuhit.play();

      this.findClosestParentOfType(ScreenStack)
        ?.push(new EditorLoader(
          new OnlineEditorContext(joinKey),
        ));
    }

    return super.onClick();
  }

  update() {
    super.update();

    this.#lastEdited.x = -this.header.x - this.movementContainer.x - 20;
  }
}
