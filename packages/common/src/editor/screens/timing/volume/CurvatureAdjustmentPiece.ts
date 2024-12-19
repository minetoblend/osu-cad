import type { Bindable, DragEndEvent, DragEvent, DragStartEvent, HoverEvent, MouseDownEvent } from 'osucad-framework';
import type { VolumePointSelectionBlueprint } from './VolumePointSelectionBlueprint';
import { Anchor, Axes, Box, clamp, CompositeDrawable, Container, dependencyLoader, EasingFunction, FastRoundedBox, Invalidation, LayoutMember, MouseButton, resolved, Vec2 } from 'osucad-framework';
import { VolumeCurveType } from '../../../../controlPoints/VolumePoint';
import { UpdateHandler } from '../../../../crdt/UpdateHandler';

export class CurvatureAdjustmentPiece extends CompositeDrawable {
  constructor(
    readonly blueprint: VolumePointSelectionBlueprint,
    readonly bindable: Bindable<Vec2>,
    readonly isEnd = false,
  ) {
    super();

    this.addLayout(this.#drawSizeBacking);

    bindable.valueChanged.addListener(this.updatePosition, this);
    blueprint.curveTypeBindable.valueChanged.addListener(this.updatePosition, this);
    blueprint.volumeBindable.valueChanged.addListener(this.updatePosition, this);
    blueprint.endVolumeBindable.valueChanged.addListener(this.updatePosition, this);
  }

  #drawSizeBacking = new LayoutMember(Invalidation.DrawSize);

  @dependencyLoader()
  [Symbol('load')]() {
    this.relativeSizeAxes = Axes.Both;
    this.color = this.blueprint.keyframeColor.value;
    this.addAllInternal(
      this.#line = new Box({
        height: 0.75,
        anchor: Anchor.TopLeft,
        origin: Anchor.CenterLeft,
      }),
      this.#handleContainer = new Container({
        relativeSizeAxes: Axes.Both,
        relativePositionAxes: Axes.Y,
        child: this.#handle = new DragHandle(this.blueprint, this.bindable),
      }),
    );
  }

  #line!: Box;

  #handleContainer!: Container;

  #handle!: DragHandle;

  updatePosition() {
    if (this.blueprint.entry?.end && this.blueprint.curveTypeBindable.value === VolumeCurveType.Smooth) {
      this.show();

      const start = this.blueprint.entry!.start;
      const end = this.blueprint.entry!.end!;

      const startY = 1 - start.volume / 100;
      const endY = 1 - end.volume / 100;
      const minY = Math.min(startY, endY);
      const maxY = Math.max(startY, endY);

      this.#handleContainer.y = minY;
      this.#handleContainer.height = maxY - minY;

      const lineStartPos = (this.isEnd
        ? new Vec2(1, endY)
        : new Vec2(0, startY))
        .mul(this.drawSize);

      const lineEndPos = new Vec2(
        this.bindable.value.x,
        startY + this.bindable.value.y * (endY - startY),
      ).mul(this.drawSize);

      const lineDir = lineEndPos.sub(lineStartPos);

      const angle = Math.atan2(lineDir.y, lineDir.x);

      this.#line.position = lineStartPos;
      this.#line.rotation = angle;
      this.#line.width = lineDir.length();

      this.#handle.updatePosition();
    }
    else {
      this.hide();
    }
  }

  override update() {
    super.update();

    if (!this.#drawSizeBacking.isValid) {
      this.updatePosition();
      this.#drawSizeBacking.validate();
    }
  }

  override onMouseDown(e: MouseDownEvent): boolean {
    if (e.button === MouseButton.Right) {
      this.bindable.setDefault();
      return true;
    }

    return false;
  }
}

class DragHandle extends CompositeDrawable {
  constructor(readonly blueprint: VolumePointSelectionBlueprint, readonly bindable: Bindable<Vec2>) {
    super();

    this.width = this.height = 16;
    this.origin = Anchor.Center;
    this.padding = 4;
    this.relativePositionAxes = Axes.Both;

    this.addAllInternal(
      this.#scaleContainer = new Container({
        relativeSizeAxes: Axes.Both,
        anchor: Anchor.Center,
        origin: Anchor.Center,
        children: [
          new FastRoundedBox({
            relativeSizeAxes: Axes.Both,
            cornerRadius: 6,
            anchor: Anchor.Center,
            origin: Anchor.Center,
            alpha: 0.5,
          }),
          new FastRoundedBox({
            relativeSizeAxes: Axes.Both,
            cornerRadius: 6,
            anchor: Anchor.Center,
            origin: Anchor.Center,
            scale: 0.75,
          }),
        ],
      }),
    );
  }

  updatePosition() {
    let position = this.bindable.value;

    if (this.blueprint.endVolumeBindable.value > this.blueprint.volumeBindable.value)
      position = new Vec2(position.x, 1 - position.y);

    this.position = position;
  }

  #scaleContainer!: Container;

  override onHover(e: HoverEvent): boolean {
    this.#scaleContainer.scaleTo(1.2, 200, EasingFunction.OutExpo);
    return true;
  }

  override onHoverLost(e: HoverEvent) {
    this.#scaleContainer.scaleTo(1, 200, EasingFunction.OutExpo);
  }

  override onDragStart(e: DragStartEvent): boolean {
    return true;
  }

  override onDrag(e: DragEvent): boolean {
    let position = this.parent!.toLocalSpace(e.screenSpaceMousePosition).div(this.parent!.drawSize);

    if (this.blueprint.endVolumeBindable.value > this.blueprint.volumeBindable.value)
      position = new Vec2(position.x, 1 - position.y);

    this.bindable.value = new Vec2(
      clamp(position.x, 0, 1),
      clamp(position.y, -5, 5),
    );

    return true;
  }

  @resolved(UpdateHandler)
  protected updateHandler!: UpdateHandler;

  override onDragEnd(e: DragEndEvent) {
    this.updateHandler.commit();
  }
}
