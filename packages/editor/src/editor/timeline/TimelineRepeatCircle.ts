import {
  Anchor,
  Axes,
  CompositeDrawable,
  FillMode,
  MouseButton,
  type MouseDownEvent,
  RoundedBox,
  resolved,
} from 'osucad-framework';
import { EditorSelection } from '../screens/compose/EditorSelection';
import { SliderUtils } from '../screens/compose/tools/SliderUtils';
import type { Slider } from '../../beatmap/hitObjects/Slider';

export class TimelineRepeatCircle extends CompositeDrawable {
  constructor(readonly hitObject: Slider, readonly index: number) {
    super();

    this.with({
      relativeSizeAxes: Axes.Both,
      relativePositionAxes: Axes.X,
      size: 0.7,
      fillMode: FillMode.Fit,
      anchor: Anchor.CenterLeft,
      origin: Anchor.Center,
    });

    this.addInternal(
      this.#circle = new RoundedBox({
        relativeSizeAxes: Axes.Both,
        cornerRadius: 100,
        fillAlpha: 0.5,
        size: 0.5,
        anchor: Anchor.Center,
        origin: Anchor.Center,
      }),
    );
  }

  #circle: RoundedBox;

  onHover(): boolean {
    this.#applyState();
    return true;
  }

  onHoverLost(): boolean {
    this.#applyState();

    return true;
  }

  get edgeSelected() {
    return this.#edgeSelected;
  }

  set edgeSelected(value: boolean) {
    if (this.#edgeSelected === value)
      return;

    this.#edgeSelected = value;

    this.#applyState();
  }

  #edgeSelected = false;

  #applyState() {
    let alpha = 0.5;
    if (this.isHovered)
      alpha += 0.1;
    if (this.#edgeSelected)
      alpha += 0.2;

    this.#circle.fillAlpha = alpha;

    if (this.#edgeSelected) {
      this.#circle.outlines = [{
        color: 0xF21D1D,
        width: 2,
        alignment: 0,
      }];
    }
    else {
      this.#circle.outlines = [];
    }
  }

  @resolved(EditorSelection)
  protected selection!: EditorSelection;

  onMouseDown(e: MouseDownEvent): boolean {
    if (e.button === MouseButton.Left) {
      if (!this.hitObject.isSelected) {
        return false;
      }

      const edges = new Set([this.index + 1]);

      this.selection.setSelectedEdges(
        this.hitObject,
        [...SliderUtils.calculateEdges(this.hitObject.selectedEdges, edges, e.controlPressed)],
      );

      return true;
    }

    return false;
  }
}
