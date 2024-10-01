import type { Bindable, HoverEvent, MouseDownEvent } from 'osucad-framework';
import { Anchor, Axes, CompositeDrawable, dependencyLoader } from 'osucad-framework';
import { OsucadSpriteText } from '../../../OsucadSpriteText.ts';
import { Toggle, ToggleTrigger } from '../../../userInterface/Toggle.ts';

export class HitSoundsTimelineLayerHeader extends CompositeDrawable {
  constructor(readonly title: string, expanded: Bindable<boolean>) {
    super();

    this.expanded = expanded.getBoundCopy();
  }

  readonly expanded: Bindable<boolean>;

  @dependencyLoader()
  load() {
    this.relativeSizeAxes = Axes.Both;
    this.padding = 12;
    this.addAllInternal(
      new OsucadSpriteText({
        text: this.title,
        margin: 4,
        fontSize: 14,
      }),
      new Toggle({ bindable: this.expanded, trigger: ToggleTrigger.MouseDown }).with({
        anchor: Anchor.TopRight,
        origin: Anchor.TopRight,
      }),
    );
  }

  onHover(e: HoverEvent): boolean {
    return true;
  }

  onMouseDown(e: MouseDownEvent): boolean {
    return true;
  }
}
