import type { Action, Bindable } from 'osucad-framework';
import { Anchor, Axes, CompositeDrawable, Container, dependencyLoader } from 'osucad-framework';
import { OsucadSpriteText } from '../../../../OsucadSpriteText.ts';
import { TextBox } from '../../../../userInterface/TextBox.ts';

export class LabelledTextBox extends CompositeDrawable {
  constructor(readonly label: string) {
    super();
  }

  @dependencyLoader()
  load() {
    this.relativeSizeAxes = Axes.X;
    this.height = 40;

    this.addAllInternal(
      new OsucadSpriteText({
        text: this.label,
        fontSize: 14,
        anchor: Anchor.CenterLeft,
        origin: Anchor.CenterLeft,
      }),
      new Container({
        relativeSizeAxes: Axes.Both,
        padding: { left: 80 },
        child: this.#textBox = new TextBox().with({
          relativeSizeAxes: Axes.X,
          anchor: Anchor.CenterLeft,
          origin: Anchor.CenterLeft,
        }),
      }),
    );

    this.onCommit = this.#textBox.onCommit;
  }

  #textBox!: TextBox;

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
}
