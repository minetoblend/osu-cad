import type { IKeyBindingHandler, KeyBindingAction, KeyBindingPressEvent, KeyDownEvent, ScrollEvent, UIEvent } from 'osucad-framework';
import { almostEquals, Axes, clamp, CompositeDrawable, Key, PlatformAction, resolved } from 'osucad-framework';
import { IBeatmap } from '../beatmap/IBeatmap';
import { EditorAction } from './EditorAction';
import { EditorClock } from './EditorClock';

export class EditorNavigation extends CompositeDrawable implements IKeyBindingHandler<EditorAction | PlatformAction> {
  constructor() {
    super();

    this.relativeSizeAxes = Axes.Both;

    this.alwaysPresent = true;
    this.requestsNonPositionalInputSubTree = true;
  }

  @resolved(EditorClock)
  protected editorClock!: EditorClock;

  @resolved(IBeatmap)
  protected beatmap!: IBeatmap;

  readonly isKeyBindingHandler = true;

  canHandleKeyBinding(binding: KeyBindingAction): boolean {
    return binding instanceof EditorAction || binding instanceof PlatformAction;
  }

  onKeyBindingPressed?(e: KeyBindingPressEvent<EditorAction | PlatformAction>): boolean {
    switch (e.pressed) {
      case EditorAction.Play:
        this.togglePlayback();
        break;
      case EditorAction.SeekToStart:
        this.seekToStart();
        break;
      case EditorAction.SeekToEnd:
        this.seekToEnd();
        break;
      case EditorAction.PlayFromStart:
        this.playFromStart();
        break;
      default:
        return false;
    }

    return true;
  }

  override onKeyDown(e: KeyDownEvent): boolean {
    if (e.controlPressed || e.metaPressed || e.altPressed || e.shiftPressed)
      return false;

    switch (e.key) {
      case Key.ArrowLeft:
        this.#seek(e, -1);
        return true;
      case Key.ArrowRight:
        this.#seek(e, 1);
        return true;
      case Key.ArrowUp:
        this.#seekControlPoint(e, 1);
        return true;
      case Key.ArrowDown:
        this.#seekControlPoint(e, -1);
        return true;
    }

    return false;
  }

  togglePlayback() {
    if (this.editorClock.isRunning)
      this.editorClock.stop();
    else
      this.editorClock.start();
  }

  seekToStart() {
    const firstObjectTime = this.beatmap.hitObjects.first?.startTime;

    if (firstObjectTime === undefined || almostEquals(this.editorClock.currentTimeAccurate, firstObjectTime))
      this.editorClock.seek(0);
    else
      this.editorClock.seek(firstObjectTime);
  }

  seekToEnd() {
    const lastObjectTime = this.beatmap.hitObjects.last?.endTime;

    if (lastObjectTime === undefined || almostEquals(this.editorClock.currentTimeAccurate, lastObjectTime))
      this.editorClock.seek(this.editorClock.trackLength);
    else
      this.editorClock.seek(lastObjectTime);
  }

  playFromStart() {
    this.editorClock.seek(0);
    this.editorClock.start();
  }

  override onScroll(e: ScrollEvent): boolean {
    const y = e.scrollDelta.y;

    if (e.controlPressed) {
      this.changeBeatSnapDivisor(Math.sign(e.scrollDelta.y));
      return true;
    }

    const amount = e.shiftPressed ? 4 : 1;

    this.editorClock.seekBeats(
      -Math.sign(y),
      !this.editorClock.isRunning,
      amount * (this.editorClock.isRunning ? 2.5 : 1),
    );

    return false;
  }

  protected changeBeatSnapDivisor(change: number) {
    let possibleSnapValues = [1, 2, 4, 8, 16];
    if (this.editorClock.beatSnapDivisor.value % 3 === 0) {
      possibleSnapValues = [1, 2, 3, 6, 12, 16];
    }

    let index = possibleSnapValues.findIndex(
      it => it >= this.editorClock.beatSnapDivisor.value,
    );

    if (index === -1) {
      index = 0;
    }

    this.editorClock.beatSnapDivisor.value
      = possibleSnapValues[
        clamp(index + change, 0, possibleSnapValues.length - 1)
      ];
  }

  #seek(e: UIEvent, direction: number) {
    const amount = e.controlPressed ? 4 : 1;

    this.editorClock.seekBeats(
      direction,
      !this.editorClock.isRunning,
      amount * (this.editorClock.isRunning ? 2.5 : 1),
    );
  }

  #seekControlPoint(e: UIEvent, direction: number) {
    const controlPointInfo = this.beatmap.controlPoints;

    const controlPoint
      = direction < 1
        ? [...controlPointInfo.timingPoints].reverse().find(cp => cp.time < this.editorClock.currentTimeAccurate)
        : controlPointInfo.timingPoints.find(
          cp => cp.time > this.editorClock.currentTimeAccurate,
        );

    if (controlPoint) {
      this.editorClock.seek(controlPoint.time);
    }
  }
}
