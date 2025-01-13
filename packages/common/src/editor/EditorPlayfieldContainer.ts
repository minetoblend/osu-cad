import type { ReadonlyDependencyContainer } from 'osucad-framework';
import type { DrawableRuleset } from '../rulesets/DrawableRuleset';
import { Axes, CompositeDrawable, resolved } from 'osucad-framework';
import { IBeatmap } from '../beatmap/IBeatmap';
import { Ruleset } from '../rulesets/Ruleset';

export class EditorPlayfieldContainer extends CompositeDrawable {
  @resolved(Ruleset)
  ruleset!: Ruleset;

  @resolved(IBeatmap)
  beatmap!: IBeatmap;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.relativeSizeAxes = Axes.Both;

    this.addInternal(
      this.#drawableRuleset = this.ruleset.createDrawableEditorRulesetWith(this.beatmap),
    );
  }

  #drawableRuleset!: DrawableRuleset;

  get drawableRuleset() {
    return this.#drawableRuleset;
  }

  get playfield() {
    return this.#drawableRuleset.playfield;
  }
}
