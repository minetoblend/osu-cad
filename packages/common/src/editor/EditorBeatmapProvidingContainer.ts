import type { ContainerOptions, Drawable, ReadonlyDependencyContainer } from 'osucad-framework';
import { Axes, Container, DependencyContainer } from 'osucad-framework';
import { IBeatmap } from '../beatmap/IBeatmap';
import { IResourcesProvider } from '../io/IResourcesProvider';
import { BeatmapSkin } from '../skinning/BeatmapSkin';
import { RulesetSkinProvidingContainer } from '../skinning/RulesetSkinProvidingContainer';
import { EditorBeatmap } from './EditorBeatmap';

export class EditorBeatmapProvidingContainer extends Container {
  constructor(readonly editorBeatmap: EditorBeatmap, options: ContainerOptions = {}) {
    super({
      relativeSizeAxes: Axes.Both,
    });

    this.#content = new Container({
      relativeSizeAxes: Axes.Both,
    });

    this.with(options);
  }

  readonly #content: Container;

  override get content(): Container<Drawable> {
    return this.#content;
  }

  #dependencies!: DependencyContainer;

  protected override createChildDependencies(parentDependencies: ReadonlyDependencyContainer): DependencyContainer {
    return this.#dependencies = new DependencyContainer(parentDependencies);
  }

  protected override get hasAsyncLoader(): boolean {
    return true;
  }

  protected override async loadAsync(dependencies: ReadonlyDependencyContainer): Promise<void> {
    await super.loadAsync(dependencies);

    if (!this.editorBeatmap.isLoaded) {
      await this.loadComponentAsync(this.editorBeatmap);

      this.editorBeatmap.ruleset?.postProcessBeatmap(this.editorBeatmap.beatmap);
    }

    this.#dependencies.provide(EditorBeatmap, this.editorBeatmap);
    this.#dependencies.provide(IBeatmap, this.editorBeatmap.beatmap);

    const ruleset = this.editorBeatmap.ruleset;
    if (!ruleset)
      return;

    const resources = this.dependencies.resolve(IResourcesProvider);

    this.addInternal(
      new RulesetSkinProvidingContainer(
        ruleset,
        this.editorBeatmap.beatmap,
        new BeatmapSkin(resources, this.editorBeatmap, this.editorBeatmap.fileStore),
      ).with({
        child: this.#content,
      }),
    );
  }
}
