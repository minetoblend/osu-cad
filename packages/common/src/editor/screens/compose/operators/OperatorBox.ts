import type { Container, ReadonlyDependencyContainer } from 'osucad-framework';
import type { Operator } from './Operator';
import { Anchor, Axes, CompositeDrawable, FastRoundedBox, FillDirection, FillFlowContainer, provide, Vec2 } from 'osucad-framework';
import { OsucadSpriteText } from '../../../../drawables/OsucadSpriteText';
import { OsucadColors } from '../../../../OsucadColors';

@provide(OperatorBox)
export class OperatorBox extends CompositeDrawable {
  constructor(readonly operator: Operator) {
    super();

    this.autoSizeAxes = Axes.Both;

    this.anchor = Anchor.BottomLeft;
    this.origin = Anchor.BottomLeft;
    this.x = 100;

    this.internalChildren = [
      new FastRoundedBox({
        relativeSizeAxes: Axes.Both,
        color: OsucadColors.translucent,
        alpha: 0.8,
      }),
      new FillFlowContainer({
        direction: FillDirection.Vertical,
        autoSizeAxes: Axes.Y,
        width: 180,
        padding: 10,
        spacing: new Vec2(4),
        children: [
          new OsucadSpriteText({
            text: operator.title,
            color: OsucadColors.text,
            fontSize: 12,
          }),
          this.#content = new FillFlowContainer({
            direction: FillDirection.Vertical,
            margin: { top: 10 },
            relativeSizeAxes: Axes.X,
            autoSizeAxes: Axes.Y,
          }),
        ],
      }),
    ];
  }

  #content!: Container;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    const properties = this.operator.properties;

    this.#content.addAll(
      ...properties.map(property => property.createDrawableRepresentation()),
    );
  }
}
