import type { IBeatmap } from '../beatmap/IBeatmap';
import type { Ruleset } from '../rulesets/Ruleset';
import type { BeatmapSkin } from './BeatmapSkin';
import type { ISkin } from './ISkin';
import { Axes, Container, dependencyLoader, resolved } from '@osucad/framework';
import { BeatmapSkinProvidingContainer } from './BeatmapSkinProvidingContainer';
import { Skin } from './Skin';
import { SkinManager } from './SkinManager';
import { SkinProvidingContainer } from './SkinProvidingContainer';

export class RulesetSkinProvidingContainer extends SkinProvidingContainer {
  protected readonly ruleset: Ruleset;
  protected readonly beatmap: IBeatmap;

  readonly #beatmapSkin: ISkin | null;

  protected override get allowFallingBackToParent(): boolean {
    return false;
  }

  readonly #content = new Container({
    relativeSizeAxes: Axes.Both,
  });

  override get content() {
    return this.#content;
  }

  constructor(ruleset: Ruleset, beatmap: IBeatmap, skin?: BeatmapSkin) {
    super();

    this.ruleset = ruleset;
    this.beatmap = beatmap;
    this.#beatmapSkin = skin ?? null;
  }

  @resolved(SkinManager)
  private skinManager!: SkinManager;

  @dependencyLoader()
  [Symbol('load')]() {
    this.internalChild = new BeatmapSkinProvidingContainer(
      this.getRulesetTransformedSkin(this.#beatmapSkin)!,
      this.getRulesetTransformedSkin(this.skinManager.defaultSkin),
    ).with({
      child: this.#content,
    });
  }

  protected getRulesetTransformedSkin(skin: ISkin | null): ISkin | null {
    if (skin == null)
      return null;

    return this.ruleset.createSkinTransformer(skin, this.beatmap) ?? skin;
  }

  protected override refreshSources() {
    super.refreshSources();

    const sources: ISkin[] = [];

    for (const source of this.parentSource!.allSources) {
      if (source instanceof Skin)
        sources.push(this.getRulesetTransformedSkin(source)!);
      else
        sources.push(source);
    }

    this.setSources(sources);
  }
}
