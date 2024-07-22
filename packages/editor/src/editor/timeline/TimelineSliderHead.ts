import type { MouseDownEvent } from 'osucad-framework';
import { FillMode, MouseButton, dependencyLoader, resolved } from 'osucad-framework';
import type { Slider } from '@osucad/common';
import { SliderUtils } from '../screens/compose/tools/SliderUtils';
import { EditorSelection } from '../screens/compose/EditorSelection';
import { TimelineElement } from './TimelineElement';
import { TimelineComboNumber } from './TimelineComboNumber';

export class TimelineSliderHead extends TimelineElement {
  constructor(readonly hitObject: Slider) {
    super({
      bodyColor: hitObject.comboColor,
      fillMode: FillMode.Fit,
    });
  }

  @dependencyLoader()
  load() {
    this.addInternal(
      new TimelineComboNumber(this.hitObject),
    );
  }

  onHover(): boolean {
    this.applyState();
    return true;
  }

  onHoverLost(): boolean {
    this.applyState();
    return true;
  }

  protected applyState() {
    this.overlay.alpha = (this.isHovered || this.isDragged) ? 0.25 : 0;
  }

  get edgeSelected() {
    return this.#edgeSelected;
  }

  set edgeSelected(value: boolean) {
    if (this.#edgeSelected === value)
      return;

    this.#edgeSelected = value;

    this.selectionColor = value
      ? 0xF21D1D
      : this.theme.selection;
  }

  #edgeSelected = false;

  @resolved(EditorSelection)
  protected selection!: EditorSelection;

  onMouseDown(e: MouseDownEvent): boolean {
    if (e.button === MouseButton.Left) {
      if (!this.hitObject.isSelected) {
        return false;
      }

      const edges = new Set([0]);

      this.selection.setSelectedEdges(
        this.hitObject,
        [...SliderUtils.calculateEdges(this.hitObject.selectedEdges, edges, e.controlPressed)],
      );

      return true;
    }

    return false;
  }
}
