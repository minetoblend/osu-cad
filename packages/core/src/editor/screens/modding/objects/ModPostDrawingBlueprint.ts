import type { ReadonlyDependencyContainer, Vec2 } from '@osucad/framework';
import type { ModPostDrawing } from './ModPostDrawing';
import { BrushStroke } from '../../../../drawables/BrushStroke';
import { OsucadColors } from '../../../../OsucadColors';
import { ModPostBlueprint } from './ModPostBlueprint';

export class ModPostDrawingBlueprint extends ModPostBlueprint<ModPostDrawing> {
  constructor(object: ModPostDrawing) {
    super(object);
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.addAllInternal(
      this.#selectionOutline = new BrushStroke().adjust((it) => {
        it.radiusOffset = 1;
        it.color = OsucadColors.selection;
        it.alpha = 0;
      }),
      this.#brushStroke = new BrushStroke(),
    );

    this.object.pathUpdated.addListener(this.#updatePath, this);
    this.object.colorBindable.valueChanged.addListener(this.#updateColor, this);
    this.#updateColor();
  }

  #brushStroke!: BrushStroke;

  #selectionOutline!: BrushStroke;

  #updatePath() {
    this.#brushStroke.points = this.object.path;
    this.#selectionOutline.points = this.object.path;
  }

  #updateColor() {
    this.#brushStroke.color = this.object.color;
  }

  protected override onSelected() {
    super.onSelected();

    this.#selectionOutline.show();
  }

  protected override onDeselected() {
    super.onDeselected();

    this.#selectionOutline.hide();
  }

  override receivePositionalInputAt(screenSpacePosition: Vec2): boolean {
    return this.#selectionOutline.receivePositionalInputAt(screenSpacePosition);
  }

  override dispose(isDisposing: boolean = true) {
    super.dispose(isDisposing);

    this.object.pathUpdated.removeListener(this.#updatePath, this);
    this.object.colorBindable.valueChanged.removeListener(this.#updateColor, this);
  }
}
