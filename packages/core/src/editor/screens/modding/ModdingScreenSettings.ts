import type { ReadonlyDependencyContainer } from '@osucad/framework';
import { Anchor, Axes, BindableBoolean, FillDirection, FillFlowContainer, Vec2 } from '@osucad/framework';
import { ModdingConfigManager } from '../../../config/ModdingConfigManager';
import { ModdingSettings } from '../../../config/ModdingSettings';
import { OsucadSpriteText } from '../../../drawables/OsucadSpriteText';
import { Checkbox } from '../../../userInterface/Checkbox';
import { Corner } from '../../ui/Corner';
import { EditorCornerContent } from '../../ui/EditorCornerContent';

export class ModdingScreenSettings extends EditorCornerContent {
  constructor() {
    super(Corner.TopRight);

    this.relativeSizeAxes = Axes.Y;
    this.width = 200;
  }

  readonly showMinorIssues = new BindableBoolean();

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    const config = dependencies.resolve(ModdingConfigManager);

    config.bindWith(ModdingSettings.ShowMinorIssues, this.showMinorIssues);

    this.addRange([
      new FillFlowContainer({
        direction: FillDirection.Vertical,
        relativeSizeAxes: Axes.X,
        autoSizeAxes: Axes.Y,
        padding: { vertical: 12 },
        anchor: Anchor.BottomLeft,
        origin: Anchor.BottomLeft,
        children: [
          new FillFlowContainer({
            direction: FillDirection.Horizontal,
            autoSizeAxes: Axes.Both,
            spacing: new Vec2(4),
            children: [
              new Checkbox({
                current: this.showMinorIssues,
                anchor: Anchor.CenterLeft,
                origin: Anchor.CenterLeft,
              }),
              new OsucadSpriteText({
                text: 'Show minor issues',
                fontSize: 14,
                anchor: Anchor.CenterLeft,
                origin: Anchor.CenterLeft,
              }),
            ],
          }),
        ],
      }),
    ]);
  }
}
