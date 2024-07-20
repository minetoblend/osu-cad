import { Axes, Container, RoundedBox, ScreenStack, dependencyLoader } from 'osucad-framework';
import { OsucadSpriteText } from '../OsucadSpriteText';
import { EditorLoader } from '../editor/EditorLoader';
import { OnlineEditorContext } from '../editor/context/OnlineEditorContext';
import { DrawableCarouselItem } from './DrawableCarouselItem';
import { CarouselBeatmap } from './CarouselBeatmap';

export class DrawableCarouselBeatmap extends DrawableCarouselItem {
  constructor(item: CarouselBeatmap) {
    super(item);

    this.header.addAll(
      this.#background = new RoundedBox({
        relativeSizeAxes: Axes.Both,
        fillColor: 0x282832,
        cornerRadius: 10,
        alpha: 0.8,
      }),
      new Container({
        padding: { horizontal: 20, vertical: 6 },
        children: [
          new OsucadSpriteText({
            text: this.item.beatmapInfo.name,
          }),
        ],
      }),
    );
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
      color: 0x52CCA3,
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

  onClick(): boolean {
    if (this.item.selected.value) {
      const joinKey = this.item.beatmapInfo.links.edit.split('/').pop()!;

      this.findClosestParentOfType(ScreenStack)
        ?.push(new EditorLoader(
          new OnlineEditorContext(joinKey),
        ));
    }

    return super.onClick();
  }
}
