import type { Action, Bindable } from 'osucad-framework';
import { Anchor, Axes, CompositeDrawable, Container, dependencyLoader, resolved } from 'osucad-framework';
import { OsucadSpriteText } from '../../../../OsucadSpriteText';
import { TextBox } from '../../../../userInterface/TextBox';
import { ThemeColors } from '../../../ThemeColors.ts';

export class LabelledTextBox extends CompositeDrawable {
  constructor(readonly label: string) {
    super();

    this.relativeSizeAxes = Axes.X;
    this.height = 40;

    this.addAllInternal(
      this.#label = new OsucadSpriteText({
        text: this.label,
        fontSize: 14,
        anchor: Anchor.CenterLeft,
        origin: Anchor.CenterLeft,
      }),
      new Container({
        relativeSizeAxes: Axes.Both,
        padding: { left: 120 },
        child: this.#textBox = new TextBox().with({
          relativeSizeAxes: Axes.X,
          anchor: Anchor.CenterLeft,
          origin: Anchor.CenterLeft,
        }),
      }),
    );

    this.onCommit = this.#textBox.onCommit;
  }

  @resolved(ThemeColors)
  colors!: ThemeColors;

  @dependencyLoader()
  load() {
    this.#label.color = this.colors.text;
  }

  readonly #textBox: TextBox;

  readonly #label: OsucadSpriteText;

  get textBox() {
    return this.#textBox;
  }

  get text() {
    return this.#textBox.text;
  }

  set text(value: string) {
    this.#textBox.text = value;
  }

  get current() {
    return this.#textBox.current;
  }

  set current(value) {
    this.#textBox.current = value;
  }

  onCommit!: Action<string>;

  bindToNumber(bindable: Bindable<number>) {
    this.onLoadComplete.addListener(() => {
      this.#textBox.bindToNumber(bindable);
    });

    return this;
  }

  get tabbableContentContainer() {
    return this.#textBox.tabbableContentContainer;
  }

  set tabbableContentContainer(value) {
    this.#textBox.tabbableContentContainer = value;
  }

  withTabbableContentContainer(value: CompositeDrawable): this {
    this.tabbableContentContainer = value;
    return this;
  }
}
