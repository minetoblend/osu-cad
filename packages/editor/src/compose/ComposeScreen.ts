import { Anchor, resolved, SpriteText, type ReadonlyDependencyContainer } from "@osucad/framework";
import { EditorScreen } from "../EditorScreen";
import { Ruleset } from "@osucad/core";

export class ComposeScreen extends EditorScreen
{
  constructor()
  {
    super();
  }

  @resolved(Ruleset)
  ruleset!: Ruleset;

  protected override load(dependencies: ReadonlyDependencyContainer)
  {
    super.load(dependencies);

    void this.loadComposer();
  }

  async loadComposer()
  {
    try
    {
      const composer = await this.ruleset.createHitObjectComposer?.();

      if (composer)
      {
        await this.loadComponentAsync(composer);

        this.addInternal(composer);
        return;
      }
    }
    catch (e)
    {
      /* noop */
      console.error(e);
    }

    this.addInternal(new SpriteText({
      text: `${this.ruleset.title} does not support editing`,
      anchor: Anchor.Center,
      origin: Anchor.Center,
    }));
  }
}
