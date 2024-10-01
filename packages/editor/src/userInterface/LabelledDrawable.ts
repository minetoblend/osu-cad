import type { DependencyContainer, Drawable } from 'osucad-framework';
import {
  Anchor,
  Axes,
  Bindable,
  BindableNumber,
  CompositeDrawable,
  Container,
  dependencyLoader,
} from 'osucad-framework';
import { ThemeColors } from '../editor/ThemeColors.ts';
import { OsucadSpriteText } from '../OsucadSpriteText.ts';

export class LabelWidthProvider {
  public readonly bindable: Bindable<number>;

  constructor(width: number | Bindable<number>) {
    this.bindable = typeof width === 'number' ? new BindableNumber(width) : width;
  }

  get value() {
    return this.bindable.value;
  }
}

export abstract class LabelledDrawable<T extends Drawable = Drawable> extends CompositeDrawable {
  protected constructor() {
    super();

    this.relativeSizeAxes = Axes.X;
    this.autoSizeAxes = Axes.Y;
  }

  labelWidth!: Bindable<number>;

  #labelText: Bindable<string> = new Bindable('');

  get labelText() {
    return this.#labelText.value;
  }

  set labelText(value) {
    this.#labelText.value = value;
  }

  #label!: OsucadSpriteText;

  #content!: Container;

  #drawable!: T;

  @dependencyLoader()
  load(dependencies: DependencyContainer) {
    const colors = dependencies.resolveOptional(ThemeColors);

    this.addAllInternal(
      this.#label = new OsucadSpriteText({
        text: this.labelText,
        anchor: Anchor.CenterLeft,
        origin: Anchor.CenterLeft,
        color: colors.text,
      }),
      this.#content = new Container({
        relativeSizeAxes: Axes.X,
        autoSizeAxes: Axes.Y,
        child: this.#drawable = this.createDrawable(),
      }),
    );

    this.labelWidth = dependencies.resolveOptional(LabelWidthProvider)?.bindable?.getBoundCopy() ?? new BindableNumber(120);

    this.labelWidth.addOnChangeListener(e => this.#content.padding = { left: e.value }, {
      immediate: true,
    });

    this.#labelText.addOnChangeListener(e => this.#label.text = e.value, {
      immediate: true,
    });
  }

  protected abstract createDrawable(): T;

  get drawable(): T {
    return this.#drawable;
  }
}
