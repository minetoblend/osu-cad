import type {
  DragEvent,
  MouseDownEvent,
} from 'osucad-framework';
import {
  Action,
  Anchor,
  Bindable,
  Box,
  CompositeDrawable,
  MouseButton,
  Vec2,
  dependencyLoader,
} from 'osucad-framework';

export class TranslateGizmo extends CompositeDrawable {
  constructor(
    position: Vec2,
  ) {
    super();

    this.positionValue = new Bindable(position);
  }

  positionValue: Bindable<Vec2>;

  @dependencyLoader()
  load() {
    this.addAllInternal(
      this.#handle = new TranslateHandle(),
    );

    this.#handle.onMove.addListener((value) => {
      this.positionValue.value = this.positionValue.value.add(value);
    });
  }

  #handle!: TranslateHandle;
}

class TranslateHandle extends CompositeDrawable {
  constructor() {
    super();

    this.width = this.height = 16;
    this.origin = Anchor.Center;
    this.alpha = 0.5;

    this.addInternal(new Box({
      width: 8,
      height: 8,
      origin: Anchor.Center,
      anchor: Anchor.Center,
    }));
  }

  onMove = new Action<Vec2>();

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
    const delta = e.mousePosition.sub(this.#lastPosition);

    this.onMove.emit(delta);

    this.#lastPosition = this.toLocalSpace(e.screenSpaceMousePosition);

    return true;
  }

  onDragEnd(): boolean {
    this.#updateState();
    return true;
  }

  onHover(): boolean {
    this.#updateState();

    return true;
  }

  onHoverLost(): boolean {
    this.#updateState();

    return true;
  }

  #updateState() {
    this.alpha = (this.isHovered || this.isDragged) ? 1 : 0.5;
  }
}
