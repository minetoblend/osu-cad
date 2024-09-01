import { Axes, Container, EasingFunction, dependencyLoader } from 'osucad-framework';
import type { Slider } from '../../beatmap/hitObjects/Slider';
import { TimelineObject } from './TimelineObject';
import { TimelineSliderTail } from './TimelineSliderTail';
import { TimelineSliderHead } from './TimelineSliderHead';
import { TimelineRepeatCircle } from './TimelineRepeatCircle';
import { TimelineVelocityBadge } from './TimelineVelocityBadge';

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

    this.#head.edgeSelected = false;
    this.#tail.edgeSelected = false;

    const repeats = this.#repeatsContainer.children as TimelineRepeatCircle[];
    for (const repeat of repeats) {
      repeat.edgeSelected = false;
    }

    for (const edge of this.hitObject.selectedEdges) {
      if (edge === 0)
        this.#head.edgeSelected = true;
      else if (edge === this.hitObject.repeatCount + 1)
        this.#tail.edgeSelected = true;
      else if (repeats[edge - 1])
        repeats[edge - 1].edgeSelected = true;
    }
  }
}
