import type {
  DragEvent,
  DragStartEvent,
} from 'osucad-framework';
import {
  Anchor,
  Axes,
  CompositeDrawable,
  MouseButton,
  RoundedBox,
  Vec2,
  resolved,
} from 'osucad-framework';
import { EditorClock } from '../EditorClock';

export class OverviewTimelineProgressBar extends CompositeDrawable {
  constructor() {
    super();

    this.padding = { top: 8 };

    this.relativeSizeAxes = Axes.Both;
    this.anchor = Anchor.Center;
    this.origin = Anchor.Center;
    this.addInternal(this.#track);
    this.addInternal(this.#activeTrack);
    this.addInternal(this.#thumb);
  }

  @resolved(EditorClock)
  editorClock!: EditorClock;

  get progress() {
    return this.editorClock.currentTime / this.editorClock.trackLength;
  }

  #track = new RoundedBox({
    relativeSizeAxes: Axes.X,
    height: 2,
    cornerRadius: 1.5,
    color: 0xFFFFFF,
    anchor: Anchor.CenterLeft,
    origin: Anchor.CenterLeft,
    alpha: 0.25,
  });

  #activeTrack = new RoundedBox({
    relativeSizeAxes: Axes.X,
    height: 2,
    cornerRadius: 1.5,
    color: 0xFFFFFF,
    anchor: Anchor.CenterLeft,
    origin: Anchor.CenterLeft,
    width: 0,
  });

  #thumb = new Thumb();

  update(): void {
    super.update();

    this.#activeTrack.width = this.progress;

    this.#thumb.x = this.progress;
  }

  onDragStart(e: DragStartEvent): boolean {
    return e.button === MouseButton.Left;
  }

  onDrag(e: DragEvent): boolean {
    const position = this.toLocalSpace(e.screenSpaceMousePosition);

    const newProgress = Math.max(0, Math.min(1, position.x / this.drawSize.x));

    this.editorClock.seek(newProgress * this.editorClock.trackLength);

    return true;
  }
}

class Thumb extends CompositeDrawable {
  constructor() {
    super();

    this.anchor = Anchor.CenterLeft;
    this.origin = Anchor.Center;
    this.relativePositionAxes = Axes.X;
    this.size = new Vec2(10, 6);

    this.addInternal(
      new RoundedBox({
        relativeSizeAxes: Axes.Both,
        cornerRadius: 4,
        color: 0xFFFFFF,
      }),
    );
  }

  onHover(): boolean {
    this.updateState();
    return true;
  }

  onHoverLost(): boolean {
    this.updateState();
    return true;
  }

  onDragStart(e: DragStartEvent): boolean {
    if (e.button === MouseButton.Left) {
      this.updateState();
      return true;
    }

    return false;
  }

  @resolved(EditorClock)
  editorClock!: EditorClock;

  onDrag(e: DragEvent): boolean {
    const position = this.parent!.toLocalSpace(e.screenSpaceMousePosition);

    const newProgress = Math.max(
      0,
      Math.min(1, position.x / this.parent!.drawSize.x),
    );

    this.editorClock.seek(newProgress * this.editorClock.trackLength);

    return true;
  }

  onDragEnd(): boolean {
    this.updateState();
    return true;
  }

  updateState() {
    if (this.isHovered || this.isDragged) {
      this.scale = new Vec2(1.2, 1.2);
    }
    else {
      this.scale = new Vec2(1, 1);
    }
  }
}
