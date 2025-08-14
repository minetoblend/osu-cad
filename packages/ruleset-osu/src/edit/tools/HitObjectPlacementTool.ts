import { ComposeTool } from "@osucad/editor";
import type { InputManager, Vec2 } from "@osucad/framework";
import { nn } from "@osucad/multiplayer-core";
import type { OsuHitObject } from "src/hitObjects";

export enum PlacementState
{
  Idle,
  Active,
  Completed,
}

export abstract class HitObjectPlacementTool<T extends OsuHitObject> extends ComposeTool
{
  #state = PlacementState.Idle;
  #hitObject!: T;
  #inputManager!: InputManager;

  protected get state()
  {
    return this.#state;
  }

  protected get isPlacementActive()
  {
    return this.#state === PlacementState.Active;
  }

  protected get hitObject(): T
  {
    return this.#hitObject;
  }

  protected abstract createHitObject(): T;

  protected abstract updateTimeAndPosition(hitObject: T,  time: number, position: Vec2): void;

  protected override loadComplete(): void
  {
    super.loadComplete();

    this.#inputManager = nn(this.getContainingInputManager());

    this.#hitObject = this.createHitObject();
    this.#updateHitObject();

    this.beatmap.hitObjects.add(this.#hitObject, true);
  }

  #updateHitObject()
  {
    const position = this.playfield.toLocalSpace(this.#inputManager.currentState.mouse.position);

    this.updateTimeAndPosition(this.hitObject, this.editorClock.currentTime, position);
  }

  beginPlacement()
  {
    if (this.#state !== PlacementState.Idle)
      return false;

    this.#state = PlacementState.Active;

    this.beatmap.hitObjects.remove(this.#hitObject);
    this.beatmap.hitObjects.add(this.#hitObject);

    this.onPlacementBegin();
    return true;
  }

  endPlacement(commit: boolean)
  {
    if (this.#state === PlacementState.Idle)
    {
      if (this.#hitObject)
        this.beatmap.hitObjects.remove(this.#hitObject);
      this.history?.discardUncommittedChanges();
      this.#state = PlacementState.Completed;
      return;
    }

    if (this.#state !== PlacementState.Active)
      return;

    this.onPlacementEnd(commit);

    if (!commit)
    {
      this.beatmap.hitObjects.remove(this.#hitObject);
      this.history?.discardUncommittedChanges();
    }
    else
    {
      this.history.commit();
    }

    this.#state = PlacementState.Completed;
    this.recreate();
  }

  override update(): void
  {
    if (this.#state === PlacementState.Completed)
      return this.recreate();

    this.#updateHitObject();

    super.update();
  }

  protected onPlacementBegin()
  {
  }

  protected onPlacementEnd(commit: boolean)
  {
  }

  override dispose(isDisposing?: boolean): void
  {
    if (this.#state !== PlacementState.Completed)
      this.endPlacement(false);

    super.dispose();
  }
}
