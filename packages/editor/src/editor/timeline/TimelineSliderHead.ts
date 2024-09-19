import type { MouseDownEvent } from 'osucad-framework';
import type { Slider } from '../../beatmap/hitObjects/Slider';
import { dependencyLoader, FillMode, MouseButton, resolved } from 'osucad-framework';
import { SliderSelectionType } from '../../beatmap/hitObjects/SliderSelection.ts';
import { EditorSelection } from '../screens/compose/EditorSelection';
import { SliderUtils } from '../screens/compose/tools/SliderUtils';
import { TimelineComboNumber } from './TimelineComboNumber';
import { TimelineElement } from './TimelineElement';
import { TimelineSlider } from './TimelineSlider';

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
    this.findClosestParentOfType(TimelineSlider)!.mouseDownWasChild = true;

    if (e.button === MouseButton.Left) {
      if (!this.hitObject.isSelected) {
        return false;
      }

      if (e.controlPressed) {
        SliderUtils.toggleEdge(this.selection, this.hitObject.subSelection, 0);
      }
      else {
        this.selection.setSliderSelection(
          this.hitObject,
          SliderSelectionType.Start,
        );
      }
    }

    return false;
  }
}
