import type { DragEndEvent, DragEvent, DragStartEvent, Vec2 } from "@osucad/framework";
import { Action, Anchor, Axes, Box, CompositeDrawable, Container, dependencyLoader, Invalidation, LayoutMember, MouseButton, provideSelf, resolved } from "@osucad/framework";
import { EditorClock } from "../../EditorClock";
import { EditorRuleset } from "../../EditorRuleset";
import { TimelineTickDisplay } from "./TimelineTickDisplay";
import { BindableBeatDivisor } from "../../BindableBeatDivisor";

@provideSelf()
export class ComposeTimeline extends CompositeDrawable
{
  public static readonly HEIGHT = 80;

  #zoomedContent!: Container;

  @resolved(EditorClock)
  accessor #editorClock!: EditorClock

  @resolved(EditorRuleset)
  accessor #editorRulest!: EditorRuleset;

  readonly #zoomedContentWidthCache = new LayoutMember(Invalidation.DrawSize);

  public constructor()
  {
    super();

    this.addLayout(this.#zoomedContentWidthCache);
  }

  @dependencyLoader()
  #load()
  {
    this.relativeSizeAxes = Axes.X;
    this.height = ComposeTimeline.HEIGHT;

    this.internalChildren = [
      new Box({
        relativeSizeAxes: Axes.Both,
        color: 0x222228,
        alpha: 0.6,
      }),
      this.#zoomedContent = new Container({
        relativeSizeAxes: Axes.Y,
        children: [
          new TimelineTickDisplay(),
          new Box({
            relativeSizeAxes: Axes.Y,
            width: 2,
            anchor: Anchor.TopCenter,
            origin: Anchor.TopCenter,
            color: "red",
          }),
        ],
      }),
      new Box({
        relativeSizeAxes: Axes.Y,
        width: 2,
        anchor: Anchor.Center,
        origin: Anchor.Center,
      }),
    ];

    const blueprintContainer = this.#editorRulest.createTimelineBlueprintContainer();

    if (blueprintContainer)
      this.#zoomedContent.add(blueprintContainer);
  }

  protected override loadComplete(): void
  {
    super.loadComplete();
  }


  protected override updateAfterChildren(): void
  {
    super.updateAfterChildren();

    this.#zoomedContent.x = -this.positionAtTime(this.#editorClock.currentTime) + this.drawWidth / 2;

    if (!this.#zoomedContentWidthCache.isValid)
      this.#udpateZoomedContentWidth();
  }

  #udpateZoomedContentWidth()
  {
    this.#zoomedContent.width = this.#editorClock.trackLength * this.zoom;

    this.#zoomedContentWidthCache.validate();
  }

  public readonly zoomChanged = new Action<number>();

  #zoom = 0.2;

  public get zoom()
  {
    return this.#zoom;
  }

  public set zoom(value)
  {
    if (this.#zoom === value)
      return;

    this.#zoom = value;
    this.zoomChanged.emit(value);
  }

  public get visibleDuration()
  {
    return this.drawWidth / this.zoom;
  }

  public get startTime()
  {
    return this.#editorClock.currentTime - this.visibleDuration * 0.5;
  }

  public get endTime()
  {
    return this.#editorClock.currentTime + this.visibleDuration * 0.5;
  }

  public timeAtPosition(x: number)
  {
    return x / this.zoom;
  }

  public positionAtTime(time: number)
  {
    return time * this.zoom;
  }

  public timeAt(screenSpacePosition: Vec2)
  {
    const local = this.toLocalSpace(screenSpacePosition);

    return this.startTime + (local.x / this.drawWidth) * this.visibleDuration;
  }

  public positionAt(time: number)
  {
    return (time - this.startTime) / this.visibleDuration * this.drawWidth;
  }

  protected override onDragStart(e: DragStartEvent): boolean
  {
    return e.button === MouseButton.Left;
  }

  protected override onDrag(e: DragEvent): boolean
  {
    const delta = this.timeAtPosition(e.mousePosition.x) - this.timeAtPosition(this.toLocalSpace(e.screenSpaceLastMousePosition).x);
    this.#editorClock.seekBy(-delta);
    return true;
  }

  @resolved(BindableBeatDivisor)
  accessor #beatDivisor!: BindableBeatDivisor

  protected override onDragEnd(e: DragEndEvent): void
  {
    this.#editorClock.seekSnapped(this.#editorClock.currentTimeAccurate);
  }
}
