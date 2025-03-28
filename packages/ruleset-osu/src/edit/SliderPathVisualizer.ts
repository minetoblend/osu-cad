import type { FastRoundedBox, ReadonlyDependencyContainer } from '@osucad/framework';
import type { Slider } from '../hitObjects/Slider';
import { OsucadConfigManager, OsucadSettings, PathType } from '@osucad/core';
import { Anchor, Axes, BindableBoolean, Box, Cached, CircularContainer, CompositeDrawable, Container, isMobile, PIXIGraphics, resolved, Vec2 } from '@osucad/framework';

export class SliderPathVisualizer extends CompositeDrawable {
  constructor(slider?: Slider) {
    super();

    if (slider)
      this.doWhenLoaded(() => this.slider = slider);
  }

  protected coloredLines = new BindableBoolean(true);

  #slider: Slider | null = null;

  #lines = new Container();
  #handles = new Container();

  get slider() {
    return this.#slider;
  }

  set slider(slider: Slider | null) {
    if (slider === this.#slider)
      return;

    if (this.#slider) {
      this.#handles.clear();
      this.#slider.path.invalidated.removeListener(this.#onSliderUpdate);
      this.#slider.positionBindable.valueChanged.removeListener(this.#onSliderUpdate);
      this.#slider.stackHeightBindable.valueChanged.removeListener(this.#onSliderUpdate);
    }

    this.#slider = slider;

    if (slider) {
      slider.path.invalidated.addListener(this.#onSliderUpdate, this);
      slider.positionBindable.valueChanged.addListener(this.#onSliderUpdate, this);
      slider.stackHeightBindable.valueChanged.addListener(this.#onSliderUpdate, this);

      this.#onSliderUpdate();
    }
    else {
      this.#graphics.clear();
      this.#handles.clear();
    }
  }

  #graphics = new PIXIGraphics();

  @resolved(OsucadConfigManager)
  config!: OsucadConfigManager;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.config.bindWith(OsucadSettings.SkinVisualizerColoredLines, this.coloredLines);

    this.drawNode.addChild(this.#graphics);

    this.addAllInternal(
      this.#lines,
      this.#handles,
    );

    this.coloredLines.addOnChangeListener(() => this.#pathCache.invalidate());
  }

  #pathCache = new Cached();

  override update() {
    super.update();

    if (!this.#pathCache.isValid && this.slider) {
      this.#updatePath(this.slider);
      this.#pathCache.validate();
    }
  }

  updatePosition = true;

  #onSliderUpdate() {
    if (this.updatePosition)
      this.position = this.#slider!.stackedPosition;
    this.#pathCache.invalidate();
  };

  #updatePath(slider: Slider) {
    this.#lines.clear();

    const controlPoints = slider.path.controlPoints;
    if (controlPoints.length === 0)
      return;

    const currentType = controlPoints[0].type!;
    console.assert(
      currentType !== null,
      'First control point\'s type cannot be null',
    );

    const coloredLines = this.coloredLines.value;

    for (let i = 1; i < controlPoints.length; i++) {
      const last = controlPoints[i - 1];
      const current = controlPoints[i];

      const delta = current.position.sub(last);
      const angle = delta.angle();

      const line = new Box({
        position: last.position,
        height: 1.5,
        width: delta.length(),
        rotation: angle,
        anchor: Anchor.CenterLeft,
        origin: Anchor.CenterLeft,
        color: coloredLines ? getColorForPathType(currentType) : 0xB6B6C3,
      });

      line.edgeSmoothness = 1;

      this.#lines.add(line);
    }

    while (this.#handles.children.length > controlPoints.length) {
      this.#handles.remove(
        this.#handles.children[this.#handles.children.length - 1],
      );
    }

    for (let i = 0; i < controlPoints.length; i++) {
      let handle = this.#handles.children[i] as
        | SliderPathVisualizerHandle
        | undefined;

      if (!handle) {
        handle = this.createHandle(controlPoints[i].type, i);
        this.#handles.add(handle);
      }

      handle.type = controlPoints[i].type;
      handle.position = controlPoints[i];
    }
  }

  override dispose(isDisposing?: boolean) {
    if (this.#slider) {
      this.#slider.path.invalidated.removeListener(this.#onSliderUpdate, this);
      this.#slider.positionBindable.valueChanged.removeListener(this.#onSliderUpdate, this);
      this.#slider.stackHeightBindable.valueChanged.removeListener(this.#onSliderUpdate, this);
    }

    super.dispose(isDisposing);
  }

  protected createHandle(type: PathType | null, index: number) {
    return new SliderPathVisualizerHandle(type, index);
  }
}

export class SliderPathVisualizerHandle extends CompositeDrawable {
  constructor(
    type: PathType | null,
    readonly index: number,
  ) {
    super();
    this.size = new Vec2(isMobile.any ? 30 : 15);
    this.origin = Anchor.Center;

    if (isMobile.any)
      this.scale = 1.2;

    this.addAllInternal(
      this.#shadow = new CircularContainer({
        size: 12,
        anchor: Anchor.Center,
        origin: Anchor.Center,
        color: 0x000000,
        alpha: 0.1,
        masking: true,
        child: new Box({ relativeSizeAxes: Axes.Both }),
      }),
      this.#handle = new CircularContainer({
        size: 9,
        anchor: Anchor.Center,
        origin: Anchor.Center,
        masking: true,
        child: new Box({ relativeSizeAxes: Axes.Both }),
      }),
    );

    this.type = type;
  }

  override updateSubTree(): boolean {
    if (!this.isLoaded)
      return super.updateSubTree();

    return true;
  }

  #shadow!: FastRoundedBox;
  #handle!: FastRoundedBox;

  get type() {
    return this.#type!;
  }

  set type(type: PathType | null) {
    if (type === this.#type)
      return;

    this.#type = type;
    this.#handle.color = getColorForPathType(type);
  }

  #type?: PathType | null;

  override onHover(): boolean {
    if (this.isDisposed)
      return false;
    this.#shadow.scale = 1.2;
    this.#handle.scale = 1.2;

    return true;
  }

  override onHoverLost(): boolean {
    if (this.isDisposed)
      return false;
    this.#shadow.scale = 1;
    this.#handle.scale = 1;

    return true;
  }
}

function getColorForPathType(type: PathType | null) {
  switch (type) {
    case PathType.Bezier:
      return 0x00FF00;
    case PathType.Catmull:
      return 0xFF0000;
    case PathType.PerfectCurve:
      return 0x0000FF;
    case PathType.Linear:
      return 0xFFFF00;
    case PathType.BSpline:
      return 0x00FFFF;
    default:
      return 0xCCCCCC;
  }
}
