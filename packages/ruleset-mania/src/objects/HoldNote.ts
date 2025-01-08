import type { HitWindows } from '@osucad/common';
import type { ValueChangedEvent } from 'osucad-framework';
import { EmptyHitWindows } from '@osucad/common';
import { HeadNote } from './HeadNote';
import { HoldNoteBody } from './HoldNoteBody';
import { ManiaHitObject } from './ManiaHitObject';
import { TailNote } from './TailNote';

export class HoldNote extends ManiaHitObject {
  constructor() {
    super();

    this.#duration.bindable.valueChanged.addListener(this.#durationChanged, this);
    this.columnBindable.valueChanged.addListener(this.#columnChanged, this);
  }

  readonly #duration = this.property('duration', 0);

  get durationBindable() {
    return this.#duration.bindable;
  }

  override get duration() {
    return this.#duration.value;
  }

  override set duration(value) {
    this.#duration.value = value;
  }

  override get endTime(): number {
    return super.endTime;
  }

  override set endTime(value) {
    this.duration = value - this.startTime;
  }

  #durationChanged(time: ValueChangedEvent<number>) {
    if (this.tail !== null)
      this.tail.startTime = this.endTime;
  }

  protected override onStartTimeChanged(time: ValueChangedEvent<number>) {
    super.onStartTimeChanged(time);

    if (this.head !== null)
      this.head.startTime = this.startTime;

    if (this.tail !== null)
      this.tail.startTime = this.endTime;
  }

  #columnChanged(column: ValueChangedEvent<number>) {
    if (this.head !== null)
      this.head.column = column.value;

    if (this.tail !== null)
      this.tail.column = column.value;
  }

  #head: HeadNote | null = null;

  get head() {
    return this.#head;
  }

  protected set head(value) {
    this.#head = value;
  }

  #tail: TailNote | null = null;

  get tail() {
    return this.#tail;
  }

  protected set tail(value) {
    this.#tail = value;
  }

  #body: HoldNoteBody | null = null;

  get body() {
    return this.#body;
  }

  protected set body(value) {
    this.#body = value;
  }

  protected override createNestedHitObjects() {
    super.createNestedHitObjects();

    this.addNested(this.head = Object.assign(new HeadNote(), {
      startTime: this.startTime,
      column: this.column,
    }));

    this.addNested(this.tail = Object.assign(new TailNote(), {
      startTime: this.endTime,
      column: this.column,
    }));

    this.addNested(this.body = Object.assign(new HoldNoteBody(), {
      startTime: this.startTime,
      column: this.column,
    }));
  }

  protected override createHitWindows(): HitWindows {
    return new EmptyHitWindows();
  }
}
