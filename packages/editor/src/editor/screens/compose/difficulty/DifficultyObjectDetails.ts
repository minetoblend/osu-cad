import type { OsuDifficultyHitObject } from '../../../../difficulty/preprocessing/OsuDifficultyHitObject.ts';
import type { DifficultyBlueprint } from './DifficultyBlueprint.ts';
import { Axes, Bindable, Container, dependencyLoader, Vec2, VisibilityContainer } from 'osucad-framework';

import { FastRoundedBox } from '../../../../drawables/FastRoundedBox.ts';
import { OsucadSpriteText } from '../../../../OsucadSpriteText.ts';

export class DifficultyObjectDetails extends VisibilityContainer {
  constructor(
    readonly blueprint: DifficultyBlueprint,
  ) {
    super();

    this.difficultyObject = blueprint.difficultyObject.getBoundCopy();
  }

  readonly difficultyObject: Bindable<OsuDifficultyHitObject | null>;

  readonly positionBindable = new Bindable(new Vec2());

  @dependencyLoader()
  load() {
    this.autoSizeAxes = Axes.Both;

    this.addAllInternal(
      new FastRoundedBox({
        relativeSizeAxes: Axes.Both,
        cornerRadius: 6,
        color: 0x222228,
      }),
      new Container({
        padding: 10,
        autoSizeAxes: Axes.Both,
        children: [
          new OsucadSpriteText({
            text: 'Details',
          }),
        ],
      }),
    );

    this.positionBindable.bindTo(this.blueprint.positionBindable);

    this.positionBindable.valueChanged.addListener(this.updatePosition, this);
  }

  updatePosition() {
    this.position = this.positionBindable.value;
  }

  protected get startHidden(): boolean {
    return true;
  }

  popIn() {
    this.fadeInFromZero(300);
  }

  popOut() {
    this.fadeOut(300);
  }
}