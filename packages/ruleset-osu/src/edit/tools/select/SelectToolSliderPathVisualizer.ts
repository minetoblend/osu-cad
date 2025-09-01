import { SliderPathHandle, SliderPathVisualizer } from "../slider/SliderPathVisualizer";
import type { Slider } from "../../../hitObjects";
import { PathPoint } from "../../../hitObjects";
import type { DragEndEvent, DragEvent, DragStartEvent, InputManager, KeyUpEvent, MouseDownEvent } from "@osucad/framework";
import { Anchor, Box } from "@osucad/framework";
import { Axes, Container } from "@osucad/framework";
import { almostEquals, dependencyLoader, type HoverEvent, type HoverLostEvent, Key, Line, MouseButton, resolved, Vec2 } from "@osucad/framework";
import type { HitObject } from "@osucad/core";
import { Playfield } from "@osucad/core";
import { BindableBeatDivisor, EditorBeatmap, EditorHistory } from "@osucad/editor";
import { HitObjectSelection } from "./HitObjectSelection";

export class SelectToolSliderPathVisualizer extends SliderPathVisualizer
{
  #insertionPointContainer!: Container;
  #insertionLine1!: Box;
  #insertionLine2!: Box;
  #insertionBox!: Box;

  #insertionPosition = new Vec2();
  #insertedIndex = -1;
  #insertionIndex = -1;
  #inputManager!: InputManager;

  public get insertionIndex()
  {
    return this.#insertionIndex;
  }

  @resolved(Playfield)
  accessor #playfield!: Playfield

  @resolved(HitObjectSelection)
  accessor #selection!: HitObjectSelection<HitObject>

  protected override createSliderPathHandle(index: number): SliderPathHandle
  {
    return new SelectToolSliderPathHandle(index, this.slider, this);
  }

  protected override onKeyUp(e: KeyUpEvent)
  {
    if (e.key === Key.ControlLeft)
    {
      this.#insertionIndex = -1;
      this.invalidatePath();
    }
  }

  @dependencyLoader()
  #load()
  {
    this.addInternal(this.#insertionPointContainer = new Container({
      relativeSizeAxes: Axes.Both,
      children: [
        this.#insertionLine1 = new Box({
          height: 1,
          origin: Anchor.CenterLeft,
        }),
        this.#insertionLine2 = new Box({
          height: 1,
          origin: Anchor.CenterLeft,
        }),
        this.#insertionBox = new Box(),
      ],
    }));
  }

  protected override loadComplete()
  {
    super.loadComplete();

    this.#inputManager = this.getContainingInputManager()!;
  }

  protected override update()
  {
    if (this.#inputManager.currentState.keyboard.controlPressed)
    {
      this.#updateInsertionIndex();

      this.invalidatePath();
    }
    else
    {
      this.#insertionIndex = -1;
    }

    super.update();
  }

  protected override onMouseDown(e: MouseDownEvent): boolean
  {
    this.#insertedIndex = -1;

    if (e.button === MouseButton.Left && e.controlPressed)
    {
      this.#updateInsertionIndex();
      if (this.#insertionIndex <= 0)
        return false;

      if (!this.#selection.has(this.slider))
      {
        this.#selection.clear();
        this.#selection.add(this.slider);
      }

      this.slider.path.controlPoints =this.slider.path.controlPoints.toSpliced(this.#insertionIndex, 0, new PathPoint(this.#insertionPosition, null));

      this.#insertedIndex = this.#insertionIndex;

      return true;
    }

    return false;
  }

  protected override onDragStart(e: DragStartEvent): boolean
  {
    return this.#insertedIndex > 0;
  }

  @resolved(EditorBeatmap)
  accessor #beatmap!: EditorBeatmap

  @resolved(BindableBeatDivisor)
  accessor #beatDivisor!: BindableBeatDivisor

  @resolved(EditorHistory)
  accessor #history!: EditorHistory

  protected override onDrag(e: DragEvent): boolean
  {
    if (this.#insertedIndex === 0)
      return false;

    const controlPoints = [...this.slider.path.controlPoints];

    controlPoints[this.#insertedIndex] = controlPoints[this.#insertedIndex].withPosition(
        this.#playfield.toLocalSpace(e.screenSpaceMousePosition)
          .sub(this.slider.stackedPosition),
    );

    this.slider.path.controlPoints = controlPoints;
    this.slider.snapPathLength(this.#beatmap.controlPointInfo, this.#beatDivisor.value);

    return true;
  }

  protected override onDragEnd(e: DragEndEvent)
  {
    super.onDragEnd(e);

    this.#history.commit();
  }

  #updateInsertionIndex()
  {
    let minIndex = -1;
    let minDistance = Number.MAX_VALUE;

    const controlPoints = this.slider.path.controlPoints;
    const mousePosition = this.#playfield.toLocalSpace(this.#inputManager.currentState.mouse.position).sub(this.slider.stackedPosition);

    for (const { position } of controlPoints)
    {
      if (Vec2.closerThan(position, mousePosition, 5))
      {
        this.#insertionIndex = -1;
        return;
      }
    }

    for (let i = 0; i < controlPoints.length - 1; i++)
    {
      const distance = Line.distance(controlPoints[i].position, controlPoints[i + 1].position, mousePosition);

      if (distance < minDistance)
      {
        minDistance = distance;
        minIndex = i;

        if (i === controlPoints.length - 2 && almostEquals(distance, controlPoints[i + 1].position.distance(mousePosition)))
          minIndex++;
      }
    }

    const lastPointDistance = controlPoints[controlPoints.length - 1].position.distance(mousePosition);

    if (lastPointDistance < minDistance)
    {
      minIndex = controlPoints.length - 1;
    }

    if (minIndex >= 0)
    {
      this.#insertionIndex = minIndex + 1;
      this.#insertionPosition = mousePosition;
    }
    else
    {
      this.#insertionIndex = -1;
    }
  }
}

export class SelectToolSliderPathHandle extends SliderPathHandle
{
  public constructor(
    public readonly index: number,
    public readonly slider: Slider,
    public readonly pathVisualizer: SelectToolSliderPathVisualizer,
  )
  {
    super();
  }

  protected override onHover(e: HoverEvent): boolean
  {
    this.scaleTo(1.5);

    return false;
  }

  protected override onHoverLost(e: HoverLostEvent)
  {
    if (!this.isDragged)
      this.scaleTo(1);
  }

  @resolved(Playfield)
  accessor #playfield!: Playfield

  @resolved(EditorBeatmap)
  accessor #beatmap!: EditorBeatmap

  @resolved(BindableBeatDivisor)
  accessor #beatDivisor!: BindableBeatDivisor

  @resolved(EditorHistory)
  accessor #history!: EditorHistory

  protected override onMouseDown(e: MouseDownEvent)
  {

    if (e.button === MouseButton.Left && e.controlPressed)
    {
      this.#cyclePathType();

      return true;
    }

    if (e.button === MouseButton.Right)
    {
      let controlPoints = [...this.slider.path.controlPoints];

      if (this.index > controlPoints.length)
        return false;

      controlPoints.splice(this.index, 1);

      if (controlPoints.length === 0)
      {
        this.#beatmap.hitObjects.remove(this.slider);
        this.#history.commit();
        return true;
      }

      if (this.index === 0)
      {
        const offset = controlPoints[0].position.scale(-1);

        controlPoints = controlPoints.map((p) => p.movedBy(offset));
      }

      this.slider.path.controlPoints = controlPoints;
      this.slider.snapPathLength(this.#beatmap.controlPointInfo, this.#beatDivisor.value);
      this.#history.commit();

      return true;
    }

    return true;
  }

  #cyclePathType()
  {
    const controlPoints = [...this.slider.path.controlPoints];

    if (this.index > controlPoints.length)
      return;

    controlPoints[this.index] = controlPoints[this.index].withNextType(this.index);

    this.slider.path.controlPoints = controlPoints;
    this.slider.snapPathLength(this.#beatmap.controlPointInfo, this.#beatDivisor.value);
    this.#history.commit();
  }

  protected override onDragStart(e: DragStartEvent)
  {
    this.scaleTo(1.5);
    return true;
  }

  protected override onDrag(e: DragEvent)
  {
    const position = this.#playfield.toLocalSpace(e.screenSpaceMousePosition);
    const lastPosition = this.#playfield.toLocalSpace(e.screenSpaceLastMousePosition);

    const delta = position.sub(lastPosition);

    const controlPoints = [...this.slider.path.controlPoints];

    if (this.index > controlPoints.length)
      return false;

    if (this.index === 0)
    {
      this.slider.moveBy(delta.x, delta.y);

      delta.scaleInPlace(-1);

      for (let i = 1; i < controlPoints.length; i++)
        controlPoints[i] = controlPoints[i].movedBy(delta);
    }
    else
    {
      controlPoints[this.index] = controlPoints[this.index].movedBy(delta);
    }

    this.slider.path.controlPoints = controlPoints;
    this.slider.snapPathLength(this.#beatmap.controlPointInfo, this.#beatDivisor.value);

    return true;
  }

  protected override onDragEnd(e: DragEndEvent)
  {
    this.#history.commit();

    if (!this.isHovered)
      this.scaleTo(1);
  }
}
