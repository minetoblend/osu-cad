import type {
  ContainerOptions,
  KeyDownEvent,
  PIXIGraphics,
} from 'osucad-framework';
import { Anchor, Axes, BindableBoolean, Container, dependencyLoader, FillDirection, FillFlowContainer, FrameStatistics, Key, StatisticsCounterType } from 'osucad-framework';

import { GraphicsDrawable } from './drawables/GraphicsDrawable';
import { OsucadSpriteText } from './OsucadSpriteText';

export class FpsOverlay extends Container {
  constructor(options: ContainerOptions = {}) {
    super();

    this.relativeSizeAxes = Axes.Both;

    this.addAllInternal(
      this.#content = new Container({
        relativeSizeAxes: Axes.Both,
      }),
      this.#overlay = new FillFlowContainer({
        direction: FillDirection.Vertical,
        padding: 5,
        autoSizeAxes: Axes.Both,
        anchor: Anchor.BottomRight,
        origin: Anchor.BottomRight,
        children: [
          this.#frameGraph = new FrameGraph().with({
            anchor: Anchor.TopRight,
            origin: Anchor.TopRight,
            width: 200,
            height: 100,
          }),
          this.#text = new OsucadSpriteText({
            text: 'FPS: 0',
            fontSize: 12,
            anchor: Anchor.TopRight,
            origin: Anchor.TopRight,
          }),
        ],
      }),
    );

    this.#text.style.align = 'right';

    this.with(options);
  }

  readonly #content: Container;

  readonly #overlay: FillFlowContainer;

  get content() {
    return this.#content;
  }

  active = new BindableBoolean(false);

  #text!: OsucadSpriteText;

  #updateTime: number = 0;

  #lastUpdateTime: number = 0;

  #lastFrameTimes: number[] = [];

  update() {
    this.#updateTime = performance.now();

    super.update();
  }

  @dependencyLoader()
  load() {
    this.active.addOnChangeListener(e => this.#overlay.alpha = e.value ? 1 : 0, { immediate: true });
  }

  updateAfterChildren() {
    const now = performance.now();

    if (!this.active.value)
      return;

    const frameTime = now - this.#lastUpdateTime;

    this.#lastFrameTimes.push(frameTime);

    const bufferSize = 400;

    if (this.#lastFrameTimes.length > bufferSize)
      this.#lastFrameTimes.shift();

    this.#frameGraph.frameTimes = this.#lastFrameTimes;

    this.#lastUpdateTime = now;

    super.updateAfterChildren();
  }

  override updateSubTreeTransforms(): boolean {
    const result = super.updateSubTreeTransforms();

    const now = performance.now();

    const updateTime = now - this.#updateTime;

    const fpsFrameTimes = this.#lastFrameTimes.slice(Math.max(0, this.#lastFrameTimes.length - 20));

    const averageFrameTime = fpsFrameTimes.reduce((a, b) => a + b, 0) / fpsFrameTimes.length;

    const fps = 1000 / averageFrameTime;

    if (now - this.#lastTextUpdate > 100) {
      this.#text.text = [
        `FPS: ${fps.toFixed(1)}`,
        `Draw: ${FrameStatistics.drawTime.toFixed(1)}ms`,
        `Update: ${updateTime.toFixed(1)}ms`,
        `Input: ${FrameStatistics.inputQueue.toFixed(1)}ms`,
        `Total: ${FrameStatistics.frameTime.toFixed(1)}ms`,
        `TransformUpdates: ${FrameStatistics.counters[StatisticsCounterType.DrawNodeTransforms]}`,
      ].join('\n');
    }

    return result;
  }

  #frameGraph!: FrameGraph;

  #lastTextUpdate = 0;

  onKeyDown(e: KeyDownEvent): boolean {
    if (e.key === Key.F10) {
      this.active.toggle();
      return true;
    }

    return false;
  }
}

class FrameGraph extends GraphicsDrawable {
  constructor() {
    super();
  }

  #frameTimes: number[] = [];

  get frameTimes() {
    return this.#frameTimes;
  }

  set frameTimes(value) {
    this.#frameTimes = value;
    this.invalidateGraphics();
  }

  updateGraphics(g: PIXIGraphics): void {
    g.clear();

    if (this.#frameTimes.length <= 1)
      return;

    const width = this.drawSize.x;
    const height = this.drawSize.y;

    const max = Math.max(...this.#frameTimes, 10);
    const min = 0;

    const scale = height / (max - min);

    g.moveTo(0, height);

    for (let i = 1; i < this.#frameTimes.length; i++) {
      const x = i * (width / this.#frameTimes.length);
      const y = (this.#frameTimes[i] - min) * scale;

      g.lineTo(x, height - y);
    }

    g.lineTo(width, height);
    g.lineTo(0, height);

    g.fill({
      color: 0xFFFFFF,
      alpha: 0.5,
    });

    for (const i of [5, 10, 20, 50, 100]) {
      const y = height - i * scale;
      if (y < 0)
        continue;

      g.moveTo(0, y);
      g.lineTo(width, y);
    }

    g.stroke({
      color: 0xFFFFFF,
      alpha: 0.5,
      width: 1,
    });

    g.roundRect(0, 0, width, height, 2).stroke(0xFFFFFF);
  }
}
