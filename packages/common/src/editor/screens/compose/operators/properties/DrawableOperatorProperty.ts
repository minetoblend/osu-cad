import type { Bindable, Drawable, ReadonlyDependencyContainer } from 'osucad-framework';
import type { OperatorProperty } from './OperatorProperty';
import { Anchor, Axes, Container, Dimension, GridContainer, GridSizeMode } from 'osucad-framework';
import { OsucadSpriteText } from '../../../../../drawables/OsucadSpriteText';
import { OsucadColors } from '../../../../../OsucadColors';

export abstract class DrawableOperatorProperty<T> extends GridContainer {
  protected constructor(protected readonly property: OperatorProperty<T>) {
    super({
      relativeSizeAxes: Axes.X,
      autoSizeAxes: Axes.Y,
      columnDimensions: [
        new Dimension(GridSizeMode.Absolute, 110),
        new Dimension(),
      ],
    });

    this.propertyValue = property.bindable.getBoundCopy();
  }

  protected readonly propertyValue: Bindable<T>;

  protected getLabels(): string[] {
    return [this.property.title];
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    const labels = this.getLabels();
    const components = this.createComponents();

    const content: (Drawable | undefined)[][] = [];

    this.rowDimensions = Array.from({ length: Math.max(labels.length, components.length) }, () => new Dimension(GridSizeMode.AutoSize));

    for (let i = 0; i < Math.max(labels.length, components.length); i++) {
      content.push([
        labels[i]
          ? new Container({
            autoSizeAxes: Axes.Both,
            anchor: Anchor.CenterRight,
            origin: Anchor.CenterRight,
            padding: { right: 6 },
            child: new OsucadSpriteText({
              text: labels[i],
              fontSize: 12,
              color: OsucadColors.text,
            }),
          })
          : undefined,
        components[i],
      ]);
    }

    this.content = content;
  }

  protected abstract createComponents(): Drawable[];
}
