import type { Bindable, ClickEvent } from '@osucad/framework';
import type { PreferencesSection } from './PreferencesSection';
import { Anchor, Axes, Box, CompositeDrawable, DrawableSprite, FillDirection, FillFlowContainer, FillMode, ScrollContainer, Vec2 } from '@osucad/framework';
import { OsucadColors } from '../../OsucadColors';

export class PreferencesOverview extends CompositeDrawable {
  constructor(activeSection: Bindable<PreferencesSection>) {
    super();

    this.width = 40;
    this.relativeSizeAxes = Axes.Y;

    this.internalChildren = [
      new Box({
        relativeSizeAxes: Axes.Both,
        alpha: 0.02,
      }),
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
      this.#background = new Box({
        relativeSizeAxes: Axes.Both,
        alpha: 0,
      }),
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
        this.#icon.fadeColor(OsucadColors.primaryHighlight);
        this.#background.fadeTo(0.25, 200);
      }
      else {
        this.#icon.fadeColor(OsucadColors.text);
        this.#background.fadeTo(0, 200);
      }
    }, true);
  }

  override onClick(e: ClickEvent): boolean {
    this.section.findClosestParentOfType(ScrollContainer)?.scrollIntoView(this.section);
    return true;
  }
}
