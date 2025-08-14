import type { HitObject } from "@osucad/core";
import { Playfield } from "@osucad/core";
import { Axes, CompositeDrawable, dependencyLoader, resolved } from "@osucad/framework";
import { EditorBeatmap, EditorHistory } from "../../runtime";
import { EditorClock } from "../../EditorClock";
import { BindableBeatDivisor } from "../../BindableBeatDivisor";
import { ComposeToolContainer } from "./ComposeToolContainer";

export abstract class ComposeTool<THitObject extends HitObject = HitObject> extends CompositeDrawable
{
  @dependencyLoader()
  #load()
  {
    this.relativeSizeAxes = Axes.Both;
  }

  @resolved(EditorBeatmap)
  protected accessor beatmap!: EditorBeatmap

  @resolved(EditorClock)
  protected accessor editorClock!: EditorClock

  @resolved(BindableBeatDivisor)
  protected accessor beatDivisor!: BindableBeatDivisor

  @resolved(Playfield)
  protected accessor playfield!: Playfield

  @resolved(EditorHistory)
  protected accessor history!: EditorHistory

  @resolved(ComposeToolContainer)
  accessor #toolContainer!: ComposeToolContainer

  protected get hitObjects(): readonly THitObject[]
  {
    return this.beatmap.hitObjects.hitObjects as readonly THitObject[];
  }

  recreate()
  {
    this.#toolContainer.refresh();
  }
}
