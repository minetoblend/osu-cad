import type { HitObject } from "@osucad/core";
import type { KeyBindingEvent, ScrollEvent } from "@osucad/framework";
import { provideSelf } from "@osucad/framework";
import { almostEquals, Axes, Container, DependencyContainer, keyBindingHandler, provide, type ReadonlyDependencyContainer, resolved } from "@osucad/framework";
import { EditorAction } from "../EditorAction";
import { EditorClock } from "../EditorClock";
import { EditorRuleset } from "../EditorRuleset";
import { EditorScreen } from "../EditorScreen";
import { EditorBeatmap } from "../runtime";
import { HitObjectSelection } from "./HitObjectSelection";
import { ComposeTimeline } from "./timeline";

@provideSelf()
export class ComposeScreen extends EditorScreen
{
  public constructor()
  {
    super();
  }

  @resolved(EditorRuleset)
  protected accessor editorRuleset!: EditorRuleset;

  @provide(HitObjectSelection)
  public readonly selection = new HitObjectSelection<HitObject>();

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

    const composer = await this.editorRuleset.createHitObjectComposer();

    await this.loadComponentAsync(composer);

    if (composer.hasTimeline)
      this.addTimeline();

    this.addInternal(new Container({
      relativeSizeAxes: Axes.Both,
      padding: { top: composer.hasTimeline ? ComposeTimeline.HEIGHT : 0 },
      child: composer,
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
    this.#editorClock.seekForward(true);
    return true;
  }

  @keyBindingHandler(EditorAction.SeekBackward)
  public seekBackward(e: KeyBindingEvent<EditorAction>)
  {
    this.#editorClock.seekBackward(true);
    return true;
  }

  @keyBindingHandler(EditorAction.TogglePlayback)
  public togglePlayback()
  {
    if (this.#editorClock.isRunning)
      this.#editorClock.stop();
    else
      this.#editorClock.start();

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
