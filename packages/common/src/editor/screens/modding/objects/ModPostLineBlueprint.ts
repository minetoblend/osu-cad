import type { Bindable, DragEvent, DragStartEvent, ReadonlyDependencyContainer } from 'osucad-framework';
import type { ModPostLine } from './ModPostLine';
import { Anchor, Axes, Box, CompositeDrawable, Container, FastRoundedBox, Vec2 } from 'osucad-framework';
import { OsucadSpriteText } from '../../../../drawables/OsucadSpriteText';
import { OsucadColors } from '../../../../OsucadColors';
import { ModPostBlueprint } from './ModPostBlueprint';

export class ModPostLineBlueprint extends ModPostBlueprint<ModPostLine> {
  constructor(object: ModPostLine) {
    super(object);
  }

  #line!: FastRoundedBox;

  #selectionOutline!: FastRoundedBox;

  #distanceText!: OsucadSpriteText;

  #selectionHitBox!: Container;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.addAllInternal(
      this.#selectionHitBox = new Container({
        width: 0,
        height: 10,
        anchor: Anchor.CenterLeft,
        origin: Anchor.CenterLeft,
        children: [
          new Container({
            relativeSizeAxes: Axes.Both,
            padding: { horizontal: -1 },
            child: this.#selectionOutline = new FastRoundedBox({
              relativeSizeAxes: Axes.X,
              height: 4,
              cornerRadius: 1,
              anchor: Anchor.CenterLeft,
              origin: Anchor.CenterLeft,
              color: OsucadColors.selection,
              alpha: 0,
            }),
          }),
          this.#line = new FastRoundedBox({
            relativeSizeAxes: Axes.X,
            height: 2,
            cornerRadius: 1,
            anchor: Anchor.CenterLeft,
            origin: Anchor.CenterLeft,
          }),
          this.#distanceText = new OsucadSpriteText({
            text: '0px',
            anchor: Anchor.BottomCenter,
            origin: Anchor.BottomCenter,
            y: -6,
            fontSize: 14,
            alpha: 0,
          }),
        ],
      }),
      this.#handles = new Container({
        alpha: 0,
        children: [
          new LineHandle(this.object.startPositionBindable),
          new LineHandle(this.object.endPositionBindable),
        ],
      }),
    );

    this.object.startPositionBindable.valueChanged.addListener(this.#updateLine, this);
    this.object.endPositionBindable.valueChanged.addListener(this.#updateLine, this);
    this.object.colorBindable.valueChanged.addListener(this.#updateLine, this);
    this.#updateLine();
  }

  #handles!: Container;

  #updateLine() {
    let { startPosition, endPosition } = this.object;

    if (endPosition.x < startPosition.x) {
      const tmp = startPosition;
      startPosition = endPosition;
      endPosition = tmp;
    }

    this.#line.color = this.object.color;

    this.#distanceText.text = `${Math.round(startPosition.distance(endPosition))}px`;
    this.#selectionHitBox.position = startPosition;
    this.#selectionHitBox.width = startPosition.distance(endPosition);
    this.#selectionHitBox.rotation = endPosition.sub(startPosition).angle();
  }

  protected override onSelected() {
    super.onSelected();

    this.#handles.show();
    this.#selectionOutline.show();
  }

  protected override onDeselected() {
    super.onDeselected();

    this.#handles.hide();
    this.#selectionOutline.hide();
  }

  override receivePositionalInputAt(screenSpacePosition: Vec2): boolean {
    return this.#selectionHitBox.receivePositionalInputAt(screenSpacePosition);
  }

  override dispose(isDisposing: boolean = true) {
    super.dispose(isDisposing);

    this.object.startPositionBindable.valueChanged.removeListener(this.#updateLine, this);
    this.object.endPositionBindable.valueChanged.removeListener(this.#updateLine, this);
    this.object.colorBindable.valueChanged.removeListener(this.#updateLine, this);
  }
}

class LineHandle extends CompositeDrawable {
  constructor(bindable: Bindable<Vec2>) {
    super();

    this.positionBindable = bindable.getBoundCopy();
  }

  protected readonly positionBindable: Bindable<Vec2>;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.size = new Vec2(6);
    this.origin = Anchor.Center;

    this.addAllInternal(
      new Box({
        relativeSizeAxes: Axes.Both,
      }),
      new Container({
        relativeSizeAxes: Axes.Both,
        padding: 1,
        child: new Box({
          relativeSizeAxes: Axes.Both,
          color: 0x000000,
        }),
      }),
    );

    this.positionBindable.addOnChangeListener(position => this.position = position.value, { immediate: true });
  }

  override onDragStart(e: DragStartEvent): boolean {
    return true;
  }

  override onDrag(e: DragEvent): boolean {
    this.positionBindable.value = this.positionBindable.value.add(e.parentSpaceDelta(this));
    return true;
  }
}
