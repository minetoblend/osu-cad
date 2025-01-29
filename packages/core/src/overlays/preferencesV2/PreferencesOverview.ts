import type { Bindable, Box, ClickEvent } from '@osucad/framework';
import type { PreferencesSection } from './PreferencesSection';
import { Anchor, Axes, CompositeDrawable, DrawableSprite, FillDirection, FillFlowContainer, FillMode, ScrollContainer, Vec2 } from '@osucad/framework';
import { OsucadColors } from '../../OsucadColors';

export class PreferencesOverview extends CompositeDrawable {
  constructor(activeSection: Bindable<PreferencesSection>) {
    super();

    this.width = 40;
    this.relativeSizeAxes = Axes.Y;

    this.internalChildren = [
      this.#content = new FillFlowContainer({
        direction: FillDirection.Vertical,
        relativeSizeAxes: Axes.Both,
      }),
    ];

    this.activeSection = activeSection.getBoundCopy();
  }

  readonly activeSection: Bindable<PreferencesSection>;

  readonly #content: FillFlowContainer<PreferencesSectionButton>;

  addSection(section: PreferencesSection) {
    this.#content.add(new PreferencesSectionButton(section, this.activeSection));
  }
}

class PreferencesSectionButton extends CompositeDrawable {
  constructor(readonly section: PreferencesSection, activeSection: Bindable<PreferencesSection>) {
    super();

    this.size = new Vec2(40, 40);

    this.internalChildren = [
      this.#icon = new DrawableSprite({
        texture: section.icon,
        relativeSizeAxes: Axes.Both,
        size: 0.65,
        fillMode: FillMode.Fit,
        anchor: Anchor.Center,
        origin: Anchor.Center,
      }),
    ];

    this.activeSection = activeSection.getBoundCopy();
  }

  readonly #background!: Box;

  readonly #icon: DrawableSprite;

  readonly activeSection: Bindable<PreferencesSection>;

  protected override loadComplete() {
    super.loadComplete();

    this.activeSection.bindValueChanged((section) => {
      if (this.section === section.value) {
        this.#icon.fadeColor('white')
          .fadeColor(OsucadColors.primaryHighlight, 200);
      }
      else {
        this.#icon.fadeColor(0xAAAAAA);
      }
    }, true);
  }

  override onClick(e: ClickEvent): boolean {
    const scrollContainer = this.section.findClosestParentOfType(ScrollContainer);

    if (scrollContainer) {
      const position = scrollContainer.getChildPosInContent(this.section);
      scrollContainer.scrollTo(position);
    }
    return true;
  }
}
