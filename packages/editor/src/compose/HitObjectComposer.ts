import type { Awaitable, DrawableRuleset, HitObject, PlayfieldAdjustmentContainer } from "@osucad/core";
import { Ruleset } from "@osucad/core";
import type { ReadonlyDependencyContainer } from "@osucad/framework";
import { Axes, CompositeDrawable, Container, resolved } from "@osucad/framework";
import { EditorBeatmap } from "../EditorBeatmap";
import { ComposeToolbar } from "./ComposeToolbar";

export abstract class HitObjectComposer extends CompositeDrawable
{
  protected constructor()
  {
    super();

    this.relativeSizeAxes = Axes.Both;
  }

  @resolved(Ruleset)
  ruleset!: Ruleset;

  @resolved(EditorBeatmap)
  beatmap!: EditorBeatmap;

  protected drawableRuleset!: DrawableRuleset;

  protected layerBelowRuleset!: PlayfieldAdjustmentContainer;

  protected override get hasAsyncLoader(): boolean
  {
    return true;
  }

  protected override async loadAsync(dependencies: ReadonlyDependencyContainer)
  {
    await super.loadAsync(dependencies);

    const drawableRuleset = this.drawableRuleset = await this.createDrawableRuleset();

    this.addRangeInternal([
      new Container({
        relativeSizeAxes: Axes.Both,
        padding: { left: ComposeToolbar.WIDTH },
        children: [
          this.layerBelowRuleset = drawableRuleset.createPlayfieldAdjustmentContainer(),
          drawableRuleset,
        ],
      }),
      new ComposeToolbar(),
    ]);

    drawableRuleset.playfield.cursor?.hide();
  }

  protected override loadComplete()
  {
    super.loadComplete();

    this.beatmap.added.addListener(this.#addHitObject, this);
    this.beatmap.removed.addListener(this.#removeHitObject, this);

    for (const h of this.beatmap.hitObjects)
      this.#addHitObject(h);
  }

  #addHitObject(hitObject: HitObject)
  {
    this.drawableRuleset.addHitObject(hitObject);
  }

  #removeHitObject(hitObject: HitObject)
  {
    this.drawableRuleset.removeHitObject(hitObject);
  }

  protected createDrawableRuleset(): Awaitable<DrawableRuleset>
  {
    return this.ruleset.createDrawableRuleset();
  }

  override dispose(isDisposing?: boolean)
  {
    this.beatmap.added.removeListener(this.#addHitObject, this);
    this.beatmap.removed.removeListener(this.#removeHitObject, this);

    super.dispose(isDisposing);
  }
}
