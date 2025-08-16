import type { KeyDownEvent } from "@osucad/framework";
import { Anchor, Axes, Container, Key, resolved, SpriteText, type ReadonlyDependencyContainer } from "@osucad/framework";
import { EditorScreen } from "../EditorScreen";
import { Ruleset } from "@osucad/core";
import { ComposeTimeline } from "./timeline/ComposeTimeline";
import { EditorBeatmap } from "../runtime";
import { EditorClock } from "../EditorClock";

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

  @resolved(EditorBeatmap)
  accessor #editorBeatmap!: EditorBeatmap;

  @resolved(EditorClock)
  accessor #editorClock!: EditorClock;

  override onKeyDown(e: KeyDownEvent): boolean
  {
    switch(e.key)
    {
    case Key.KeyZ:{
      const first = this.#editorBeatmap.hitObjects[0];
      if (first && this.#editorClock.currentTime !== first.startTime)
        this.#editorClock.seek(first.startTime);
      else
        this.#editorClock.seek(0);
      break;}
    }

    return false;
  }
}
