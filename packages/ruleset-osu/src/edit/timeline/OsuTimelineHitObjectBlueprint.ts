import type { HitObjectLifetimeEntry, HitObjectSelectionEvent } from '@osucad/core';
import type { ReadonlyDependencyContainer } from '@osucad/framework';
import type { TimelineHitObjectTail } from './TimelineHitObjectTail';
import { TimelineHitObjectBlueprint } from '@osucad/core';
import { Axes, Container, provide } from '@osucad/framework';
import { Slider } from '../../hitObjects/Slider';
import { SliderRepeat } from '../../hitObjects/SliderRepeat';
import { Spinner } from '../../hitObjects/Spinner';
import { OsuSelectionManager } from '../OsuSelectionManager';
import { DurationAdjustmentPiece } from './DurationAdjustmentPiece';
import { SliderVelocityAdjustmentPiece } from './SliderVelocityAdjustmentPiece';
import { TimelineHitObjectBody } from './TimelineHitObjectBody';
import { TimelineHitObjectHead } from './TimelineHitObjectHead';
import { TimelineRepeatPiece } from './TimelineRepeatPiece';

@provide()
export class OsuTimelineHitObjectBlueprint extends TimelineHitObjectBlueprint {
  constructor() {
    super();
  }

  protected content!: Container;

  protected body!: TimelineHitObjectBody;

  protected bodyContainer!: Container;

  protected head!: TimelineHitObjectHead;

  protected tail: TimelineHitObjectTail | null = null;

  #repeatContainer!: Container<TimelineRepeatPiece>;

  #tailContainer!: Container;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.addAllInternal(
      this.bodyContainer = new Container({
        relativeSizeAxes: Axes.Both,
        children: [
          this.body = new TimelineHitObjectBody(this),
        ],
      }),
      this.#tailContainer = new Container({
        relativeSizeAxes: Axes.Both,
      }),
      this.#repeatContainer = new Container<TimelineRepeatPiece>({
        relativeSizeAxes: Axes.Both,
      }),
      this.head = new TimelineHitObjectHead(this),
    );
  }

  protected override loadComplete() {
    super.loadComplete();

    this.selection?.selectionChanged.addListener(this.#selectionChanged, this);
  }

  #selectionChanged(evt: HitObjectSelectionEvent) {
    if (evt.hitObject === this.hitObject)
      this.#updateSelection();
  }

  #updateSelection() {
    this.selected.value = !!this.hitObject && !!this.selection?.isSelected(this.hitObject);

    if (this.selection && this.selection instanceof OsuSelectionManager && this.hitObject instanceof Slider) {
      const slider = this.hitObject as Slider;

      const type = this.selection.getSelectionType(slider);

      const headActive = type === 'head' || type === 0;
      this.head.selectionOverlay.color = headActive ? 0xFF0000 : 0xFFFFFF;

      const tailActive
        = type === slider.spanCount
        || (slider.spanCount % 2 === 0 && type === 'head')
        || (slider.spanCount % 2 === 1 && type === 'tail');

      if (this.tail)
        this.tail.selectionOverlay.color = tailActive ? 0xFF0000 : 0xFFFFFF;

      for (const repeat of this.#repeatContainer.children) {
        const isTail = repeat.repeat.repeatIndex % 2 === 0;

        const isActive = (repeat.repeat.repeatIndex + 1 === type) || (isTail ? type === 'tail' : type === 'head');
        repeat.selectionOverlay.color = isActive ? 0xFF0000 : 0xFFFFFF;
      }
    }
  }

  preventSelection = false;

  protected override onApply(entry: HitObjectLifetimeEntry) {
    super.onApply(entry);

    if (entry.hitObject instanceof Spinner)
      this.#tailContainer.add(this.tail = new DurationAdjustmentPiece(this, entry.hitObject));
    else if (entry.hitObject instanceof Slider)
      this.#tailContainer.add(this.tail = new SliderVelocityAdjustmentPiece(this, entry.hitObject));
    else
      this.tail = null;

    entry.hitObject.defaultsApplied.addListener(this.#defaultsApplied, this);

    if (this.selection)
      this.selected.value = this.selection.isSelected(entry.hitObject);

    this.updateComboColor();
    this.#defaultsApplied();
  }

  protected override onFree(entry: HitObjectLifetimeEntry) {
    super.onFree(entry);

    entry.hitObject.defaultsApplied.removeListener(this.#defaultsApplied, this);

    this.#tailContainer.clear();
  }

  #contentPadding = 0;

  override update() {
    super.update();

    const duration = this.hitObject!.duration;

    if (this.width !== duration)
      this.width = duration;

    const contentPadding = this.drawHeight * 0.5;

    if (this.#contentPadding !== contentPadding) {
      this.bodyContainer.padding = { horizontal: -contentPadding };
      this.#contentPadding = contentPadding;
    }
  }

  #defaultsApplied() {
    this.#repeatContainer.clear();

    for (const hitObject of this.hitObject!.nestedHitObjects) {
      if (hitObject instanceof SliderRepeat) {
        this.#repeatContainer.add(new TimelineRepeatPiece(this, hitObject).with({
          depth: hitObject.startTime,
        }));
      }
    }

    this.#updateSelection();
  }

  override dispose(isDisposing: boolean = true) {
    super.dispose(isDisposing);

    this.selection?.selectionChanged.removeListener(this.#selectionChanged, this);
  }
}
