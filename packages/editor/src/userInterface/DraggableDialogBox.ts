import type {
  ContainerOptions,
  DragEvent,
  Drawable,
  MouseDownEvent,
} from 'osucad-framework';
import {
  Axes,
  CompositeDrawable,
  Container,
  FillDirection,
  FillFlowContainer,
  MouseButton,
  Vec2,
  dependencyLoader,
} from 'osucad-framework';
import { BackdropBlurFilter } from 'pixi-filters';
import { FastRoundedBox } from '../drawables/FastRoundedBox';
import { OsucadSpriteText } from '../OsucadSpriteText';

export interface DraggableDialogBoxOptions extends ContainerOptions {
  title: string;
}

export abstract class DraggableDialogBox extends CompositeDrawable {
  protected constructor() {
    super();

    this.autoSizeAxes = Axes.Both;
  }

  abstract getTitle(): string;

  abstract createContent(): Drawable;

  @dependencyLoader()
  load() {
    const filter = new BackdropBlurFilter({
      quality: 3,
      strength: 15,
    });
    filter.padding = 30;

    this.addAllInternal(
      new FastRoundedBox({
        relativeSizeAxes: Axes.Both,
        cornerRadius: 4,
        color: 0x222228,
        alpha: 0.8,
        filters: [filter],
      }),
      new FillFlowContainer({
        direction: FillDirection.Vertical,
        autoSizeAxes: Axes.Both,
        children: [
          new Container({
            autoSizeAxes: Axes.Both,
            padding: 4,
            children: [
              new OsucadSpriteText({
                fontSize: 12,
                text: this.getTitle(),
                color: 0xB6B6C3,
              }),
            ],
          }),
          new Container({
            autoSizeAxes: Axes.Both,
            padding: 4,
            children: [
              this.createContent(),
            ],
          }),
        ],
      }),
    );
  }

  #lastPosition = new Vec2(0);

  onMouseDown(e: MouseDownEvent): boolean {
    if (e.button === MouseButton.Left) {
      this.#lastPosition = e.mousePosition;
      return true;
    }

    return false;
  }

  onDragStart(): boolean {
    return true;
  }

  onDrag(e: DragEvent): boolean {
    const position = e.mousePosition;

    const delta = position.sub(this.#lastPosition);

    this.position = this.position.add(delta);

    this.updateDrawNodeTransform();

    this.#lastPosition = this.toLocalSpace(e.screenSpaceMousePosition);

    return true;
  }
}
