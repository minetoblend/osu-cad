import type { ContainerOptions, Drawable, ReadonlyDependencyContainer } from 'osucad-framework';
import { Axes, Container, DependencyContainer, resolved } from 'osucad-framework';
import { IBeatmap } from '../beatmap/IBeatmap';
import { IResourcesProvider } from '../io/IResourcesProvider';
import { Ruleset } from '../rulesets/Ruleset';
import { BeatmapSkin } from '../skinning/BeatmapSkin';
import { ISkinSource } from '../skinning/ISkinSource';
import { RulesetSkinProvidingContainer } from '../skinning/RulesetSkinProvidingContainer';
import { SkinManager } from '../skinning/SkinManager';
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

  @resolved(Ruleset)
  ruleset!: Ruleset;

  protected override async loadAsync(dependencies: ReadonlyDependencyContainer): Promise<void> {
    await super.loadAsync(dependencies);

    if (!this.editorBeatmap.isLoaded) {
      await this.loadComponentAsync(this.editorBeatmap);

      this.editorBeatmap.beatmap.preProcess();
      this.ruleset.postProcessBeatmap(this.editorBeatmap.beatmap);
    }

    this.#dependencies.provide(EditorBeatmap, this.editorBeatmap);
    this.#dependencies.provide(IBeatmap, this.editorBeatmap.beatmap);

    const resources = this.dependencies.resolve(IResourcesProvider);

    const beatmapSkin = new BeatmapSkin(resources, this.editorBeatmap.beatmap, this.editorBeatmap.fileStore);

    await beatmapSkin.load();

    this.#dependencies.provide(ISkinSource, dependencies.resolve(SkinManager));

    this.addInternal(
      new RulesetSkinProvidingContainer(
        this.ruleset,
        this.editorBeatmap.beatmap,
        beatmapSkin,
      ).with({
        child: this.#content,
      }),
    );
  }
}
