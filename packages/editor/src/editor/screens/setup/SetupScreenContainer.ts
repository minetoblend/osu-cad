import type { SetupScreenSection } from './SetupScreenSection.ts';
import { Axes, CompositeDrawable, dependencyLoader, Direction, FillFlowContainer, Vec2 } from 'osucad-framework';
import { MainScrollContainer } from '../../MainScrollContainer.ts';
import { ColorsSection } from './ColorsSection.ts';
import { DifficultySection } from './DifficultySection.ts';
import { MetadataSection } from './MetadataSection.ts';

export class SetupScreenContainer extends CompositeDrawable {
  @dependencyLoader()
  load() {
    this.relativeSizeAxes = Axes.Both;

    this.addInternal(
      this.scroll = new MainScrollContainer(Direction.Vertical).with({
        relativeSizeAxes: Axes.Both,
        masking: false,
        children: [
          this.mainContent = new FillFlowContainer({
            relativeSizeAxes: Axes.X,
            autoSizeAxes: Axes.Y,
            spacing: new Vec2(8),
            padding: { bottom: 20 },
          }),
        ],
      }),
    );

    const sections = this.createSections();

    for (const section of sections)
      this.#addSection(section);
  }

  scroll!: MainScrollContainer;

  mainContent!: FillFlowContainer;

  protected createSections(): SetupScreenSection[] {
    return [
      new MetadataSection(),
      new DifficultySection(),
      new ColorsSection(),
    ];
  }

  #addSection(section: SetupScreenSection) {
    this.mainContent.add(section);
  }
}
