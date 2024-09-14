import {
  Axes,
  Container,
  EasingFunction,
  dependencyLoader,
  MouseDownEvent,
  MouseButton,
  MouseUpEvent,
} from 'osucad-framework';
import type { Slider } from '../../beatmap/hitObjects/Slider';
import { TimelineObject } from './TimelineObject';
import { TimelineSliderTail } from './TimelineSliderTail';
import { TimelineSliderHead } from './TimelineSliderHead';
import { TimelineRepeatCircle } from './TimelineRepeatCircle';
import { TimelineVelocityBadge } from './TimelineVelocityBadge';
import { SliderSelectionType } from '../../beatmap/hitObjects/SliderSelection.ts';

export class TimelineSlider extends TimelineObject<Slider> {
  constructor(slider: Slider) {
    super(slider);
  }

  #tail!: TimelineSliderTail;

  #repeatsContainer!: Container;

  #head!: TimelineSliderHead;

  @dependencyLoader()
  load() {
    this.body.outline.alpha = 0;

    this.addAll(
      this.#repeatsContainer = new Container({
        relativeSizeAxes: Axes.Both,
      }),
      this.#tail = new TimelineSliderTail(this.hitObject),
      this.#head = new TimelineSliderHead(this.hitObject),
      new TimelineVelocityBadge(this.hitObject),
    );
  }

  #firstSetup = true;

  setup() {
    super.setup();

    const { comboColor, repeatCount } = this.hitObject;

    this.#head.bodyColor = comboColor;
    this.#tail.bodyColor = comboColor;

    this.#setupRepeats(repeatCount);

    this.#firstSetup = false;
  }

  #setupRepeats(repeats: number) {
    const children = this.#repeatsContainer.children as TimelineRepeatCircle[];
    while (children.length > repeats) {
      this.#repeatsContainer.remove(children[children.length - 1]!);
    }

    for (let i = 0; i < repeats; i++) {
      let child = children[i];

      if (!child) {
        this.#repeatsContainer.add(
          child = new TimelineRepeatCircle(this.hitObject, i),
        );

        if (!this.#firstSetup) {
          child.scale = 0;
          child.scaleTo(1, 300, EasingFunction.OutBack);
        }
      }

      // using relative positioning
      child.x = (i + 1) / (repeats + 1);
    }
  }

  mouseDownWasHead = false;

  mouseDownWasChild = false;

  update() {
    super.update();

    const padding = this.drawSize.y * 0.5;
    if (this.#repeatsContainer.padding.left !== padding) {
      this.#repeatsContainer.padding = { horizontal: padding };
    }
  }

  protected selectionChanged(selected: boolean) {
    super.selectionChanged(selected);

    this.#head.selected = selected;
    this.#tail.selected = selected;

    this.#head.edgeSelected = this.hitObject.subSelection.startSelected;
    this.#tail.edgeSelected = this.hitObject.subSelection.endSelected;

    const repeats = this.#repeatsContainer.children as TimelineRepeatCircle[];
    const selection = this.hitObject.subSelection;

    for (const repeat of repeats) {
      repeat.edgeSelected = !selection.bodySelected && selection.selectedEdges.has(repeat.index + 1);
    }

    if (this.hitObject.subSelection.type === SliderSelectionType.Body) {
      this.body.outline.alpha = 1;
      this.body.outline.color = 0xFF0000;
    } else {
      this.body.outline.alpha = 0;
    }
  }

  protected override selectFromMouseDown(e: MouseDownEvent): boolean {
    if (!this.mouseDownWasChild
      && e.button === MouseButton.Left
      && !e.controlPressed
      && this.hitObject.subSelection.type !== SliderSelectionType.Body
      && this.hitObject.isSelected
    ) {
      this.selection.setSliderSelection(this.hitObject, SliderSelectionType.Body);
      return true;
    }

    return super.selectFromMouseDown(e);
  }

  onMouseUp(e: MouseUpEvent) {
    this.mouseDownWasChild = false;
  }
}
