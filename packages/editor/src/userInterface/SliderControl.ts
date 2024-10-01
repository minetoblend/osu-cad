import type {
  Bindable,
  DragEndEvent,
  DragEvent,
  DragStartEvent,
  HoverEvent,
  HoverLostEvent,
} from 'osucad-framework';
import type { EditorCommand } from '../editor/commands/EditorCommand.ts';
import {
  Action,
  Anchor,
  Axes,
  BindableNumber,
  BindableWithCurrent,
  clamp,
  CompositeDrawable,
  dependencyLoader,
  EasingFunction,
  lerp,
  MouseButton,
  Vec2,
} from 'osucad-framework';
import { FastRoundedBox } from '../drawables/FastRoundedBox.ts';
import { CommandManager } from '../editor/context/CommandManager.ts';

export class SliderControl extends CompositeDrawable {
  constructor() {
    super();

    // some defaults
    this.#value.minValue = 0;
    this.#value.maxValue = 10;
  }

  #current = new BindableWithCurrent<number>(0);

  commitImmediately = false;

  get current() {
    return this.#current.current;
  }

  set current(value: Bindable<number>) {
    this.#current.current = value;

    if (value instanceof BindableNumber) {
      if (value.minValue !== Number.MIN_VALUE)
        this.#value.minValue = value.minValue;
      if (value.maxValue !== Number.MAX_VALUE)
        this.#value.maxValue = value.maxValue;
      this.#value.precision = value.precision;
    }
  }

  #value = new BindableNumber(0);

  get value(): Bindable<number> {
    return this.#value;
  }

  get minValue() {
    return this.#value.minValue;
  }

  set minValue(value) {
    this.#value.minValue = value;
  }

  get maxValue() {
    return this.#value.maxValue;
  }

  set maxValue(value) {
    this.#value.maxValue = value;
  }

  get precision() {
    return this.#value.precision;
  }

  set precision(value) {
    this.#value.precision = value;
  }

  @dependencyLoader()
  private load() {
    this.padding = { horizontal: 6 };
    this.height = 35;
    this.relativeSizeAxes = Axes.X;

    this.addAllInternal(
      this.#track = new FastRoundedBox({
        relativeSizeAxes: Axes.X,
        height: 4,
        anchor: Anchor.CenterLeft,
        origin: Anchor.CenterLeft,
        alpha: 0.2,
        cornerRadius: 2,
      }),
      this.#activeTrack = new FastRoundedBox({
        relativeSizeAxes: Axes.X,
        height: 4,
        anchor: Anchor.CenterLeft,
        origin: Anchor.CenterLeft,
        cornerRadius: 2,
      }),
      this.#thumb = new Thumb(this.#value),
    );

    this.#value.addOnChangeListener((e) => {
      const relativeValue = clamp((e.value - this.#value.minValue) / (this.#value.maxValue - this.#value.minValue), 0, 1);

      this.#activeTrack.resizeWidthTo(relativeValue, 200, EasingFunction.OutExpo);
      this.#thumb.moveToX(relativeValue, 200, EasingFunction.OutExpo);

      if (this.commitImmediately)
        this.current.value = e.value;
    }, { immediate: true });

    this.#current.addOnChangeListener(e => this.#value.value = e.value, { immediate: true });

    this.#thumb.dragEnd.addListener(() => this.#current.value = this.#value.value);
  }

  #track!: FastRoundedBox;
  #activeTrack!: FastRoundedBox;
  #thumb!: Thumb;

  bindWithCommandManager(
    bindable: BindableNumber,
    createCommand: (value: number) => EditorCommand | null,
  ) {
    this.doWhenLoaded(() => {
      const commandManager = this.dependencies.resolve(CommandManager);

      bindable.copyTo(this.value);

      bindable.valueChanged.addListener(e => this.current.value = e.value);

      this.current.valueChanged.addListener((e) => {
        const command = createCommand(e.value);
        if (command)
          commandManager.submit(command, false);
      });

      this.#thumb.dragEnd.addListener(() => commandManager.commit());
    });

    return this;
  }
}

class Thumb extends CompositeDrawable {
  constructor(value: BindableNumber) {
    super();

    this.#value = value.getBoundCopy();
  }

  readonly #value!: BindableNumber;

  readonly dragEnd = new Action();

  @dependencyLoader()
  load() {
    this.anchor = Anchor.CenterLeft;
    this.origin = Anchor.Center;
    this.relativePositionAxes = Axes.X;

    this.size = new Vec2(20, 16);
    this.addInternal(new FastRoundedBox({
      size: new Vec2(12, 8),
      cornerRadius: 4,
      anchor: Anchor.Center,
      origin: Anchor.Center,
    }));
  }

  onDragStart(e: DragStartEvent): boolean {
    return e.button === MouseButton.Left;
  }

  onDrag(e: DragEvent): boolean {
    if (!this.parent)
      return false;

    const position = this.parent!.toLocalSpace(e.screenSpaceMousePosition).x - this.parent!.childOffset.x;

    const relativeValue = position / this.parent!.childSize.x;

    this.#value.value = lerp(this.#value.minValue, this.#value.maxValue, clamp(relativeValue, 0, 1));

    return true;
  }

  onDragEnd(e: DragEndEvent) {
    this.dragEnd.emit();
  }

  onHover(e: HoverEvent): boolean {
    this.internalChild.scale = 1.2;
    return true;
  }

  onHoverLost(e: HoverLostEvent) {
    this.internalChild.scale = 1;
  }
}
