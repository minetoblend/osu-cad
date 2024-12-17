import type { HoverEvent, HoverLostEvent, InputManager, KeyDownEvent, MouseMoveEvent } from 'osucad-framework';
import { Anchor, AudioBufferTrack, Axes, Bindable, Box, dependencyLoader, Key, ProxyContainer, resolved } from 'osucad-framework';
import { ControlPointInfo } from '../../../controlPoints/ControlPointInfo';
import { TimingPoint } from '../../../controlPoints/TimingPoint';
import { EditorBeatmap } from '../../EditorBeatmap';
import { DrawableWaveform } from './DrawableWaveform';
import { TimingPointKeyframeContainer } from './TimingPointKeyframeContainer';
import { TimingScreenTimelineLayer } from './TimingScreenTimelineLayer';

export class TimingPointLayer extends TimingScreenTimelineLayer {
  constructor() {
    super('Timing');
  }

  override get layerColor() {
    return 0xFF265A;
  }

  @resolved(EditorBeatmap)
  editorBeatmap!: EditorBeatmap;

  #keyframeContainer!: TimingPointKeyframeContainer;

  #inputManager!: InputManager;

  protected override loadComplete() {
    super.loadComplete();

    this.#inputManager = this.getContainingInputManager()!;
  }

  @dependencyLoader()
  [Symbol('load')]() {
    this.add(this.#keyframeContainer = new TimingPointKeyframeContainer());
    this.add(new Box({
      relativeSizeAxes: Axes.X,
      height: 24,
      alpha: 0.02,
      anchor: Anchor.CenterLeft,
      origin: Anchor.CenterLeft,
    }));

    const track = this.editorBeatmap.track.value;

    if (track instanceof AudioBufferTrack) {
      this.timeline.timeline.add(new ProxyContainer(this.content).with({
        depth: 1,
        children: [
          new DrawableWaveform(track, {
            relativeSizeAxes: Axes.Both,
          }),
        ],
      }));
    }

    this.#addingControlPoints.addOnChangeListener((event) => {
      for (const point of event.previousValue)
        this.controlPointInfo.timingPoints.remove(point);

      for (const point of event.value)
        this.controlPointInfo.timingPoints.add(point);
    });
  }

  readonly #addingControlPoints = new Bindable<TimingPoint[]>([]);

  #ctrlDown = false;

  @resolved(ControlPointInfo)
  controlPointInfo!: ControlPointInfo;

  get timeAtMousePosition() {
    const position = this.timeline.timeline.toLocalSpace(this.#inputManager.currentState.mouse.position);

    return this.timeline.timeline.positionToTime(position.x);
  }

  #updateInsertState() {
    if (this.isHovered && this.#ctrlDown) {
      if (this.#addingControlPoints.value.length === 0) {
        const timingPoint = this.controlPointInfo.timingPointAt(this.timeAtMousePosition);

        this.#addingControlPoints.value = [
          new TimingPoint(timingPoint.beatLength, timingPoint.meter),
        ];
      }

      const delta = this.timeAtMousePosition - this.#addingControlPoints.value[0].time;
      this.#addingControlPoints.value.forEach(it => it.time += delta);
    }
    else {
      this.#addingControlPoints.value = [];
    }
  }

  override onKeyDown(e: KeyDownEvent): boolean {
    if (e.key === Key.ControlLeft) {
      this.#ctrlDown = true;
      this.#updateInsertState();
      return false;
    }

    return false;
  }

  override onMouseMove(e: MouseMoveEvent): boolean {
    if (this.#ctrlDown)
      this.#updateInsertState();

    return false;
  }

  override onKeyUp(e: KeyDownEvent) {
    if (e.key === Key.ControlLeft) {
      this.#ctrlDown = false;
      this.#updateInsertState();
    }
  }

  override onHover(e: HoverEvent): boolean {
    this.#updateInsertState();
    return true;
  }

  override onHoverLost(e: HoverLostEvent) {
    this.#updateInsertState();
  }
}
