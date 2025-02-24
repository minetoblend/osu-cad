import type { ContainerOptions, GameHost, KeyDownEvent, PIXIGraphics } from '@osucad/framework';
import type { ColorSource } from 'pixi.js';
import { Anchor, Axes, BindableBoolean, Container, FillDirection, FillFlowContainer, FrameStatistics, GAME_HOST, GraphicsDrawable, Key, resolved, StatisticsCounterType } from '@osucad/framework';
import { OsucadSpriteText } from '../drawables/OsucadSpriteText';

export class PerformanceOverlay extends Container {
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

    for (let i = 0; i < 100; i++)
      this.#lastFrameTimes.push(0);
  }

  readonly #content: Container;

  readonly #overlay: FillFlowContainer;

  override get content() {
    return this.#content;
  }

  active = new BindableBoolean(false);

  #text!: OsucadSpriteText;

  #updateTime: number = 0;

  #lastUpdateTime: number = 0;

  #lastFrameTimes: number[] = [];

  override update() {
    this.#updateTime = performance.now();

    super.update();
  }

  protected override loadComplete() {
    super.loadComplete();
    this.active.addOnChangeListener(e => this.#overlay.alpha = e.value ? 1 : 0, { immediate: true });

    this.host.afterRender.addListener(this.updateValues, this);
  }

  @resolved(GAME_HOST)
  host!: GameHost;

  #lastFrameTime = 0;

  total = new MovingAverage(100);

  updateValues() {
    const now = performance.now();

    const updateTime = now - this.#updateTime;

    const fpsFrameTimes = this.#lastFrameTimes.slice(Math.max(0, this.#lastFrameTimes.length - 20));

    this.#lastFrameTimes.push(now - this.#lastFrameTime);
    if (this.#lastFrameTimes.length > 100)
      this.#lastFrameTimes.shift();

    this.#lastFrameTime = now;

    const averageFrameTime = fpsFrameTimes.reduce((a, b) => a + b, 0) / fpsFrameTimes.length;

    const fps = 1000 / averageFrameTime;

    this.total.add(FrameStatistics.frame.total);

    if (now - this.#lastTextUpdate > 100) {
      this.#text.text = [
        `FPS: ${fps.toFixed(1)}`,
        `Draw: ${FrameStatistics.draw.total.toFixed(1)}ms`,
        `Update: ${updateTime.toFixed(1)}ms`,
        `Input (Mouse): ${FrameStatistics.positionalInputQueue.total.toFixed(1)}ms`,
        `Input (Keyboard): ${FrameStatistics.nonPositionalInputQueue.total.toFixed(1)}ms`,
        `Invalidations: ${FrameStatistics.counters[StatisticsCounterType.Invalidations]}`,
        `Total: ${this.total.getAverage().toFixed(1)}ms`,
        `TransformUpdates: ${FrameStatistics.counters[StatisticsCounterType.DrawNodeTransforms]}`,
      ].join('\n');
    }

    this.#frameGraph.append({
      draw: FrameStatistics.draw.total,
      update: FrameStatistics.updateSubTree.total,
      transforms: FrameStatistics.updateSubTreeTransforms.total,
      total: FrameStatistics.frame.total,
    });
  }

  #frameGraph!: FrameGraph;

  #lastTextUpdate = 0;

  override onKeyDown(e: KeyDownEvent): boolean {
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

  frameTimes: { draw: number; transforms: number; update: number; total: number }[] = [];

  append(
    frame: { draw: number; transforms: number; update: number; total: number },
  ) {
    this.frameTimes.push(frame);
    if (this.frameTimes.length > 100)
      this.frameTimes.shift();
    this.invalidateGraphics();
  }

  updateGraphics(g: PIXIGraphics): void {
    return; // TODO: figure out more performant way of doing this
    g.clear();

    if (this.frameTimes.length <= 1)
      return;

    const width = this.drawSize.x;
    const height = this.drawSize.y;

    const max = Math.max(...this.frameTimes.map(it => it.total), 10);
    const min = 0;

    const scaleY = height / (max - min);

    const offsets = Array.from({ length: this.frameTimes.length }, () => 0);

    const scaleX = width / this.frameTimes.length;

    const drawGraph = (values: number[], color: ColorSource) => {
      g.beginPath();

      g.moveTo(0, height - (offsets[0] - min) * scaleY);
      for (let i = 1; i < values.length; i++)
        g.lineTo(i * scaleX, height - (offsets[i] - min) * scaleY);

      for (let i = values.length - 1; i >= 0; i--) {
        g.lineTo(i * scaleX, height - (values[i] + offsets[i] - min) * scaleY);
        offsets[i] += values[i];
      }

      g.closePath();
      g.fill({ color, alpha: 0.5 });
    };

    drawGraph(this.frameTimes.map(it => it.update), 0xFFFF00);
    drawGraph(this.frameTimes.map(it => it.transforms), 0x00FFFF);
    drawGraph(this.frameTimes.map(it => it.draw), 0xFF0000);
    drawGraph(this.frameTimes.map(it => it.total - (it.draw + it.update + it.transforms)), 0xFFFFFF);

    for (const i of [5, 10, 20, 50, 100]) {
      const y = height - i * scaleY;
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

class MovingAverage {
  constructor(readonly windowSize: number) {
  }

  readonly values: number[] = [];

  add(value: number) {
    this.values.push(value);
    if (this.values.length > this.windowSize)
      this.values.shift();
  }

  getAverage() {
    if (this.values.length === 0)
      return 0;

    return this.values.reduce((a, b) => a + b, 0) / this.values.length;
  }
}
