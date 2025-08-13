import { Anchor, Axes, Container, resolved, SpriteText, type ReadonlyDependencyContainer } from "@osucad/framework";
import { EditorScreen } from "../EditorScreen";
import { Ruleset } from "@osucad/core";
import { ComposeTimeline } from "./timeline/ComposeTimeline";

export class ComposeScreen extends EditorScreen
{
  constructor()
  {
    super();
  }

  @resolved(Ruleset)
  accessor ruleset!: Ruleset;

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


        this.addInternal(new Container({
          relativeSizeAxes: Axes.Both,
          padding: { top: composer.hasTimeline ? ComposeTimeline.HEIGHT : 0 },
          child: composer,
        }));

        if (composer.hasTimeline)
          this.addTimeline();
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

  addTimeline()
  {
    this.addInternal(new ComposeTimeline());
  }
}
