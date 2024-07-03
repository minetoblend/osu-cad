import { ComposeToolInteraction } from './ComposeToolInteraction';
import {
  dependencyLoader,
  MouseMoveEvent,
  MouseUpEvent,
  RoundedBox,
  Vec2,
} from 'osucad-framework';

export class SelectBoxInteraction extends ComposeToolInteraction {
  constructor(readonly startPosition: Vec2) {
    super();
  }

  @dependencyLoader()
  load() {
    this.add(
      (this.#selectBox = new RoundedBox({
        cornerRadius: 1,
        fillAlpha: 0.1,
        width: 0,
        height: 0,
        outline: {
          width: 1,
          color: this.theme.primary,
          alpha: 1,
        },
      })),
    );
  }

  #selectBox!: RoundedBox;

  onMouseMove(e: MouseMoveEvent): boolean {
    const min = this.startPosition.componentMin(e.mousePosition);
    const max = this.startPosition.componentMax(e.mousePosition);

    this.#selectBox.position = min;
    this.#selectBox.size = max.sub(min);

    return true;
  }

  onMouseUp(e: MouseUpEvent): boolean {
    this.complete();
    return true;
  }
}
