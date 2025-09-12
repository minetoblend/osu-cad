import type { DragEndEvent, DragEvent, DragStartEvent, ScrollEvent, Vec2 } from "@osucad/framework";
import { Action, Anchor, Axes, Box, clamp, CompositeDrawable, Container, dependencyLoader, Invalidation, LayoutMember, MouseButton, provideSelf, resolved } from "@osucad/framework";
import { EditorClock } from "../../EditorClock";
import { EditorRuleset } from "../../EditorRuleset";
import { TimelineTickDisplay } from "./TimelineTickDisplay";

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
      this.#zoomedContent.add(blueprintContainer.with({ depth: 1 }));
  }

  protected override loadComplete(): void
  {
    super.loadComplete();

    this.#updateZoomedContentWidth();

    this.#editorClock.trackChanged.addListener(this.#updateZoomedContentWidth, this);
  }


  protected override updateAfterChildren(): void
  {
    super.updateAfterChildren();

    this.#zoomedContent.x = -this.positionAtTime(this.#editorClock.currentTime) + this.drawWidth / 2;
  }

  #updateZoomedContentWidth()
  {
    this.#zoomedContent.width = this.#editorClock.trackLength * this.zoom;

    this.#zoomedContentWidthCache.validate();
  }

  public readonly zoomChanged = new Action<number>();

  #zoom = 0.5;

  public get zoom()
  {
    return this.#zoom;
  }

  public set zoom(value)
  {
    if (this.#zoom === value)
      return;

    this.#zoom = value;
    this.#updateZoomedContentWidth();
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

  public timeAtScreenSpacePosition(screenSpacePosition: Vec2)
  {
    const local = this.toLocalSpace(screenSpacePosition);

    return this.timeAtPosition(local.x) + this.startTime;
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

  protected override onDragEnd(e: DragEndEvent): void
  {
    this.#editorClock.seekSnapped(this.#editorClock.currentTimeAccurate);
  }

  protected override onScroll(e: ScrollEvent): boolean
  {
    if (e.controlPressed)
    {
      this.zoom = clamp(this.zoom + e.scrollDelta.y * 0.03, 0.2, 2);

      return true;
    }

    return false;
  }

  override dispose()
  {
    this.#editorClock.trackChanged.removeListener(this.#updateZoomedContentWidth, this);

    super.dispose();
  }
}
