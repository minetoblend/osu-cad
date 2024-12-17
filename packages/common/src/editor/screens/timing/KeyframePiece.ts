import type {
  ClickEvent,
  DragEndEvent,
  DragEvent,
  DragStartEvent,
  DrawableOptions,
  HoverEvent,
  MouseDownEvent,
} from 'osucad-framework';
import type { ControlPoint } from '../../../controlPoints/ControlPoint';
import type { KeyframeBlueprint } from './KeyframeBlueprint';
import {
  Anchor,
  Axes,
  BindableBoolean,
  ColorUtils,
  CompositeDrawable,
  Container,
  dependencyLoader,
  EasingFunction,
  FastRoundedBox,
  MouseButton,
  resolved,
} from 'osucad-framework';
import { ControlPointInfo } from '../../../controlPoints/ControlPointInfo';
import { TimingPoint } from '../../../controlPoints/TimingPoint';
import { EditorClock } from '../../EditorClock';
import { Timeline } from '../../ui/timeline/Timeline';

export class KeyframePiece extends CompositeDrawable {
  constructor(
    readonly blueprint: KeyframeBlueprint<ControlPoint>,
    options: DrawableOptions = {},
  ) {
    super();

    this.with(options);
  }

  #body!: FastRoundedBox;

  #outline!: FastRoundedBox;

  #scaleContainer!: Container;

  readonly selected = new BindableBoolean(false);

  get keyframeColor() {
    return this.blueprint.keyframeColor;
  }

  @dependencyLoader()
  load() {
    this.addInternal(
      this.#scaleContainer = new Container({
        relativeSizeAxes: Axes.Both,
        anchor: Anchor.Center,
        origin: Anchor.Center,
        children: [
          this.#outline = new FastRoundedBox({
            relativeSizeAxes: Axes.Both,
            cornerRadius: 2,
            anchor: Anchor.Center,
            origin: Anchor.Center,
            rotation: Math.PI / 4,
            alpha: 0.5,
          }),
          this.#body = new FastRoundedBox({
            relativeSizeAxes: Axes.Both,
            scale: 0.75,
            cornerRadius: 2,
            anchor: Anchor.Center,
            origin: Anchor.Center,
            rotation: Math.PI / 4,
          }),
        ],
      }),
    );

    this.selected.valueChanged.addListener(this.#updateColor, this);
    this.#updateColor();
  }

  #updateColor() {
    if (this.selected.value) {
      this.#body.color = ColorUtils.lighten(this.keyframeColor, 0.5);
      this.#outline.color = ColorUtils.lighten(this.keyframeColor, 1);
      this.#outline.alpha = 1;
    }
    else {
      this.#body.color = this.keyframeColor;
      this.#outline.color = this.keyframeColor;
      this.#outline.alpha = 0.5;
    }
  }

  override onClick(e: ClickEvent): boolean {
    this.selected.value = true;
    return true;
  }

  override onMouseDown(e: MouseDownEvent): boolean {
    if (e.button === MouseButton.Right) {
      this.blueprint.controlPoint!.group?.remove(this.blueprint.controlPoint!);
      return true;
    }

    return false;
  }

  override onHover(e: HoverEvent): boolean {
    this.#scaleContainer.scaleTo(1.2, 200, EasingFunction.OutExpo);
    return true;
  }

  override onHoverLost(e: HoverEvent) {
    this.#scaleContainer.scaleTo(1, 200, EasingFunction.OutExpo);
  }

  override onDragStart(e: DragStartEvent): boolean {
    if (this.blueprint.controlPoint! instanceof TimingPoint)
      this.#scaleContainer.hide();
    return true;
  }

  @resolved(Timeline)
  protected timeline!: Timeline;

  @resolved(EditorClock)
  protected editorClock!: EditorClock;

  @resolved(ControlPointInfo)
  protected controlPointInfo!: ControlPointInfo;

  override onDrag(e: DragEvent): boolean {
    let time = this.timeline.screenSpacePositionToTime(e.screenSpaceMousePosition);

    if (!(this.blueprint.controlPoint! instanceof TimingPoint) && !e.shiftPressed) {
      time = this.controlPointInfo.snap(time, this.editorClock.beatSnapDivisor.value);
    }

    this.blueprint.controlPoint!.time = time;

    return true;
  }

  override onDragEnd(e: DragEndEvent) {
    this.#scaleContainer.show();
  }
}
