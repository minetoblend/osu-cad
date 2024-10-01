import type { Bindable, CompositeDrawable } from 'osucad-framework';
import type { EditorCommand } from '../../../commands/EditorCommand.ts';
import { resolved } from 'osucad-framework';
import { LabelledDrawable } from '../../../../userInterface/LabelledDrawable.ts';
import { TextBox } from '../../../../userInterface/TextBox';
import { ThemeColors } from '../../../ThemeColors.ts';

export class LabelledTextBox extends LabelledDrawable<TextBox> {
  constructor(label: string) {
    super();
    this.labelText = label;
  }

  protected createDrawable(): TextBox {
    return new TextBox();
  }

  @resolved(ThemeColors)
  colors!: ThemeColors;

  get textBox() {
    return this.drawable;
  }

  get text() {
    return this.textBox?.text ?? '';
  }

  set text(value: string) {
    this.doWhenLoaded(() => this.textBox.text = value);
  }

  get current(): Bindable<string> {
    return this.textBox.current;
  }

  set current(value: Bindable<string>) {
    this.textBox.current = value;
  }

  get onCommit() {
    return this.drawable.onCommit;
  }

  bindToNumber(bindable: Bindable<number>) {
    this.doWhenLoaded(() => this.textBox.bindToNumber(bindable));

    return this;
  }

  get tabbableContentContainer() {
    return this.textBox.tabbableContentContainer;
  }

  set tabbableContentContainer(value) {
    this.textBox.tabbableContentContainer = value;
  }

  withTabbableContentContainer(value: CompositeDrawable): this {
    this.doWhenLoaded(() => this.tabbableContentContainer = value);

    return this;
  }

  withCurrent(value: Bindable<string>) {
    this.doWhenLoaded(() => this.current = value);
    return this;
  }

  notBlank() {
    this.doWhenLoaded(() => this.textBox.notBlank());
    return this;
  }

  asciiOnly() {
    this.doWhenLoaded(() => this.textBox.asciiOnly());
    return this;
  }

  bindWithCommandManager(
    bindable: Bindable<string>,
    createCommand: (value: string) => EditorCommand | null,
  ) {
    this.doWhenLoaded(() => this.drawable.bindWithCommandManager(bindable, createCommand));

    return this;
  }
}
