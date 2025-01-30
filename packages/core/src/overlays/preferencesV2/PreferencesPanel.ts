import type { ReadonlyDependencyContainer } from '@osucad/framework';
import type { PreferencesSection } from './PreferencesSection';
import { Anchor, Axes, BetterBackdropBlurFilter, Bindable, Box, Container, Dimension, FillFlowContainer, GridContainer, GridSizeMode, provide, Vec2 } from '@osucad/framework';
import { OsucadScrollContainer } from '../../drawables/OsucadScrollContainer';
import { AudioSection } from './AudioSection';
import { ITabbableContentContainer } from './ITabbableContentContainer';
import { PreferencesOverview } from './PreferencesOverview';
import { SkinningSection } from './SkinningSection';
import { ViewportSection } from './ViewportSection';

@provide(ITabbableContentContainer)
export class PreferencesPanel extends Container<PreferencesSection> {
  readonly #content: FillFlowContainer<PreferencesSection>;

  override get content(): Container<PreferencesSection> {
    return this.#content;
  }

  #overview: PreferencesOverview;

  #scroll: OsucadScrollContainer;

  readonly activeSection = new Bindable<PreferencesSection>(null!);

  constructor() {
    super();

    this.relativeSizeAxes = Axes.Y;
    this.width = 400;

    this.filters = [
      new BetterBackdropBlurFilter({
        strength: 20,
        quality: 4,
      }),
    ];

    this.internalChildren = [
      new Box({
        relativeSizeAxes: Axes.Both,
        color: 0x0A0A0A,
        alpha: 0.9,
      }),
      new Box({
        width: 0.5,
        relativeSizeAxes: Axes.Y,
        alpha: 0.05,
        anchor: Anchor.TopRight,
        origin: Anchor.TopRight,
      }),
      new GridContainer({
        relativeSizeAxes: Axes.Both,
        rowDimensions: [
          new Dimension(GridSizeMode.Distributed),
        ],
        columnDimensions: [
          new Dimension(GridSizeMode.AutoSize),
          new Dimension(),
        ],
        content: [
          [
            this.#overview = new PreferencesOverview(this.activeSection),

            this.#scroll = new OsucadScrollContainer().with({
              relativeSizeAxes: Axes.Both,
              children: [
                this.#content = new FillFlowContainer<PreferencesSection>({
                  relativeSizeAxes: Axes.X,
                  autoSizeAxes: Axes.Y,
                  spacing: new Vec2(4),
                  padding: { horizontal: 12, vertical: 8 },
                }),
              ],
            }),
          ],
        ],
      }),
    ];
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    const sections = [
      new AudioSection(),
      new ViewportSection(),
      new SkinningSection(),
    ];

    for (const section of sections)
      this.addSection(section);
  }

  addSection(section: PreferencesSection) {
    this.#content.add(section);
    this.#overview.addSection(section);
  }

  override updateAfterChildren() {
    super.updateAfterChildren();

    for (let i = this.#content.children.length - 1; i >= 0; i--) {
      const section = this.#content.children[i];

      const position = section.drawPosition.y - this.#scroll.target;
      if (position < this.drawHeight * 0.1 || i === 0) {
        this.activeSection.value = section;
        break;
      }
    }

    this.#scroll.content.padding = { bottom: this.drawHeight };
  }
}
