import {
  BindableBeatDivisor, ComposerStatusBar, type ComposeTool,
  EditorBeatmap,
  EditorHistory,
  HitObjectSelection,
  Hotkeys,
  ModalComposeTool,
} from "@osucad/editor";
import { Bindable, clamp, type MouseMoveEvent, Quad, resolved, Vec2 } from "@osucad/framework";
import { OsuOperatorUtils } from "../../operators/OsuOperatorUtils";
import { OsuPlayfield } from "../../../ui";
import type { OsuHitObject } from "../../../hitObjects";
import { Slider, Spinner } from "../../../hitObjects";
import { Matrix } from "pixi.js";
import { Playfield } from "@osucad/core";
import { DashedLine } from "../misc/DashedLine";

export class ScaleTool extends ModalComposeTool
{
  @resolved(HitObjectSelection)
  accessor #selection!: HitObjectSelection<OsuHitObject>;

  @resolved(EditorHistory)
  accessor #history!: EditorHistory

  @resolved(EditorBeatmap)
  accessor #beatmap!: EditorBeatmap;

  @resolved(BindableBeatDivisor)
  accessor #beatDivisor!: BindableBeatDivisor;

  @resolved(Playfield)
  accessor #playfield!: Playfield

  readonly #statusBar: ComposerStatusBar;
  readonly #lineToCursor: DashedLine;

  public constructor()
  {
    super();

    this.internalChildren = [
      this.#statusBar = new ComposerStatusBar(),
      this.#lineToCursor = new DashedLine().with({
        alpha: 0.5,
      }),
    ];
  }

  @Hotkeys.inputNumberString()
  private readonly stringValue = new Bindable<string>("");

  protected override loadComplete()
  {
    super.loadComplete();

    // this.transformOrigin.bindValueChanged(this.#updateState, this);
    // this.snapped.bindValueChanged(this.#updateState, this);
    this.stringValue.bindValueChanged(this.#updateState, this);

    this.invalidateState();
  }

  #lastMousePosition?: Vec2;
  #lastOrigin!: Vec2;
  #scale = 1;

  private resolveOrigin(): Vec2
  {
    return OsuOperatorUtils.getBounds(this.#selection)?.center ?? OsuPlayfield.BOUNDS.center;
  }

  private invalidateState()
  {
    this.scheduler.addOnce(this.#updateState, this);
  }

  protected override onMouseMove(e: MouseMoveEvent): boolean
  {
    if (this.completed)
      return true;

    const position = this.#playfield.toLocalSpace(e.screenSpaceMousePosition);

    if (!this.#lastMousePosition)
    {
      this.#lastMousePosition = position;
      return true;
    }

    const origin = this.#lastOrigin;

    const newDistance = position.distance(origin);
    const oldDistance = this.#lastMousePosition.distance(origin);

    const scaleDelta = newDistance / oldDistance;

    if (Number.isFinite(scaleDelta))
    {
      this.#scale = clamp(this.#scale * scaleDelta, 0.05, 10);
    }

    this.#updateState();

    this.#lastMousePosition = position;

    return true;
  }

  private getMaxScale(origin: Vec2): number
  {
    const selectionBounds = OsuOperatorUtils.getBounds(this.#selection);
    if (!selectionBounds)
      return 1;
    const maxBounds = OsuPlayfield.BOUNDS;

    const min = Math.min(
        (origin.x - maxBounds.left) / (origin.x - selectionBounds.left),
        (maxBounds.right - origin.x) / (selectionBounds.right - origin.x),
        (origin.y - maxBounds.top) / (origin.y - selectionBounds.top),
        (maxBounds.bottom - origin.y) / (selectionBounds.bottom - origin.y),
    );

    if (Number.isFinite(min) && min > 1)
      return min;

    return 1;
  }

  #updateState()
  {
    if (this.toolContainer.activeSubTool !== this)
      return;

    this.#history.discardUncommittedChanges();

    const origin = this.#lastOrigin= this.resolveOrigin();

    if (this.#lastMousePosition)
    {
      this.#lineToCursor.startPosition = this.#playfield.toSpaceOfOtherDrawable(origin, this);
      this.#lineToCursor.endPosition = this.#playfield.toSpaceOfOtherDrawable(this.#lastMousePosition, this);
    }

    let scale = this.#scale;

    if (this.stringValue.value.length > 0)
    {
      const value = Number.parseFloat(this.stringValue.value);
      if (Number.isFinite(value))
        scale = value;
    }

    scale = clamp(scale, 0.05, this.getMaxScale(origin));

    console.log(scale);

    const transform = new Matrix()
      .translate(-origin.x, -origin.y)
      .scale(scale, scale)
      .translate(origin.x, origin.y);

    const pathTransform = new Matrix().scale(scale, scale);

    for (const obj of this.#selection)
    {
      if (obj instanceof Spinner)
        continue;

      obj.position = transform.apply(obj.position, new Vec2());

      if (obj instanceof Slider)
      {
        obj.applyToPath(p => p.transform(pathTransform));

        obj.snapPathLength(this.#beatmap.controlPointInfo, this.#beatDivisor.value);
      }
    }

    if (this.stringValue.value.length > 0)
    {
      this.#statusBar.text = `[${this.stringValue.value}|] = ${Math.round(this.#scale * 1000) / 1000}x`;
    }
    else
    {
      this.#statusBar.text = `${Math.round(this.#scale * 1000) / 1000}x`;
    }
  }

  @Hotkeys.key("MouseLeftButton", { label: "Confirm", priority: Number.MAX_VALUE })
  @Hotkeys.key("Enter")
  #complete()
  {
    this.complete();
  }

  @Hotkeys.key("MouseRightButton", { label: "Cancel", priority: Number.MAX_VALUE })
  @Hotkeys.key("Escape")
  #cancel()
  {
    this.cancel();
  }

  public override onEntering(previous?: ComposeTool)
  {
    super.onEntering(previous);

    this.history.commit();
  }

  protected override onCompleted(result?: void)
  {
    super.onCompleted(result);

    this.history.commit();
  }

  protected override onCanceled()
  {
    super.onCanceled();

    this.history.discardUncommittedChanges();
  }
}
