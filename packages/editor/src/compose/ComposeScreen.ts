import { Ruleset } from "@osucad/core";
import type { KeyBindingEvent, ScrollEvent } from "@osucad/framework";
import { almostEquals, Anchor, Axes, Container, DependencyContainer, keyBindingHandler, resolved, SpriteText, type ReadonlyDependencyContainer } from "@osucad/framework";
import { EditorAction } from "../EditorAction";
import { EditorClock } from "../EditorClock";
import { EditorScreen } from "../EditorScreen";
import { EditorBeatmap } from "../runtime";
import { ComposeTimeline } from "./timeline/ComposeTimeline";

export class ComposeScreen extends EditorScreen
{
  public constructor()
  {
    super();
  }

  @resolved(Ruleset)
  protected accessor ruleset!: Ruleset;

  protected override load(dependencies: ReadonlyDependencyContainer)
  {
    super.load(dependencies);

    void this.loadComposer();
  }

  #dependencies!: DependencyContainer;

  protected override createChildDependencies(parentDependencies: ReadonlyDependencyContainer): ReadonlyDependencyContainer
  {
    return this.#dependencies = new DependencyContainer(parentDependencies);
  }

  protected async loadComposer()
  {
    try
    {
      const composer = await this.ruleset.createHitObjectComposer?.();

      if (composer)
      {
        await this.loadComponentAsync(composer);

        if (composer.hasTimeline)
          this.addTimeline();

        this.addInternal(new Container({
          relativeSizeAxes: Axes.Both,
          padding: { top: composer.hasTimeline ? ComposeTimeline.HEIGHT : 0 },
          child: composer,
        }));
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

  protected addTimeline()
  {
    const timeline = new ComposeTimeline().with({ depth: -1 });

    this.#dependencies.provide(ComposeTimeline, timeline);
    this.addInternal(timeline);
  }

  @resolved(EditorBeatmap)
  accessor #editorBeatmap!: EditorBeatmap;

  @resolved(EditorClock)
  accessor #editorClock!: EditorClock;

  @keyBindingHandler(EditorAction.SeekToStart)
  public seekToStart()
  {
    const first = this.#editorBeatmap.hitObjects.first;

    if (first && !almostEquals(this.#editorClock.currentTimeAccurate, first.startTime))
      this.#editorClock.seekSmoothlyTo(first.startTime);
    else
      this.#editorClock.seekSmoothlyTo(0);

    return true;
  }

  @keyBindingHandler(EditorAction.SeekToEnd)
  public seekToEnd()
  {
    const last = this.#editorBeatmap.hitObjects.last;
    if (last && !almostEquals(this.#editorClock.currentTimeAccurate, last.endTime))
      this.#editorClock.seekSmoothlyTo(last.endTime);
    else
      this.#editorClock.seekSmoothlyTo(this.#editorClock.trackLength);

    return true;
  }

  @keyBindingHandler(EditorAction.SeekForward)
  public seekForward(e: KeyBindingEvent<EditorAction>)
  {
    this.#editorClock.seekBeats(1, true);
    return true;
  }

  @keyBindingHandler(EditorAction.SeekBackward)
  public seekBackward(e: KeyBindingEvent<EditorAction>)
  {
    this.#editorClock.seekBeats(-1, true);
    return true;
  }

  public override onScroll(e: ScrollEvent): boolean
  {
    const y = e.scrollDelta.y;

    const amount = e.shiftPressed ? 4 : 1;

    this.#editorClock.seekBeats(
        -Math.sign(y),
        !this.#editorClock.isRunning,
        amount * (this.#editorClock.isRunning ? 2.5 : 1),
    );

    return false;
  }
}
