import type { DragEndEvent, DragEvent, DragStartEvent, MouseDownEvent } from 'osucad-framework';
import type { Slider } from '../../../../beatmap/hitObjects/Slider';
import {
  Anchor,
  Axes,
  Cached,
  CompositeDrawable,
  Container,
  dependencyLoader,
  PIXIGraphics,
  Vec2,
} from 'osucad-framework';
import { PathType } from '../../../../beatmap/hitObjects/PathType';
import { FastRoundedBox } from '../../../../drawables/FastRoundedBox.ts';

export class SliderPathVisualizer extends CompositeDrawable {
  constructor() {
    super();
  }

  #slider: Slider | null = null;

  #handles = new Container();

  onHandleMouseDown?: (index: number, e: MouseDownEvent) => boolean;
  onHandleDragStarted?: (index: number, e: DragStartEvent) => boolean;
  onHandleDragged?: (index: number, e: DragEvent) => boolean;
  onHandleDragEnded?: (index: number, e: DragEndEvent) => void;

  get slider() {
    return this.#slider;
  }

  set slider(slider: Slider | null) {
    if (slider === this.#slider)
      return;

    if (this.#slider) {
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

  @dependencyLoader()
  load() {
    this.drawNode.addChild(this.#graphics);

    this.addInternal(this.#handles);
  }

  #pathCache = new Cached();

  update() {
    super.update();

    if (!this.#pathCache.isValid && this.slider) {
      this.#updatePath(this.slider);
      this.#pathCache.validate();
    }
  }

  #onSliderUpdate() {
    this.position = this.#slider!.stackedPosition;
    this.#pathCache.invalidate();
  };

  #updatePath(slider: Slider) {
    const g = this.#graphics;
    g.clear();

    const controlPoints = slider.path.controlPoints;
    let currentType = controlPoints[0].type!;
    console.assert(
      currentType !== null,
      'First control point\'s type cannot be null',
    );

    g.moveTo(0, 0);

    for (let i = 1; i < controlPoints.length; i++) {
      const point = controlPoints[i];

      g.lineTo(point.x, point.y);

      if (point.type !== null || i === controlPoints.length - 1) {
        g.stroke({
          width: 1.5,
          color: getColorForPathType(currentType),
          cap: 'round',
          join: 'round',
        });

        currentType = point.type!;
      }
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
        handle = new SliderPathVisualizerHandle(controlPoints[i].type, i);
        this.#handles.add(handle);

        handle.mouseDown = this.onHandleMouseDown;
        handle.dragStarted = this.onHandleDragStarted;
        handle.dragged = this.onHandleDragged;
        handle.dragEnded = this.onHandleDragEnded;
      }

      handle.type = controlPoints[i].type;
      handle.position = controlPoints[i];
    }
  }

  dispose(isDisposing?: boolean) {
    this.slider = null;

    super.dispose(isDisposing);
  }
}

class SliderPathVisualizerHandle extends CompositeDrawable {
  constructor(
    type: PathType | null,
    readonly index: number,
  ) {
    super();
    this.size = new Vec2(15);
    this.origin = Anchor.Center;

    this.addAllInternal(
      (this.#shadow = new FastRoundedBox({
        relativeSizeAxes: Axes.Both,
        size: 0.8,
        anchor: Anchor.Center,
        origin: Anchor.Center,
        cornerRadius: 5,
        color: 0x000000,
        alpha: 0.1,
      })),
      (this.#handle = new FastRoundedBox({
        relativeSizeAxes: Axes.Both,
        size: 0.6,
        anchor: Anchor.Center,
        origin: Anchor.Center,
        cornerRadius: 5,
      })),
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

  onHover(): boolean {
    this.#shadow.scale = 1.2;
    this.#handle.scale = 1.2;

    return true;
  }

  onHoverLost(): boolean {
    this.#shadow.scale = 1;
    this.#handle.scale = 1;

    return true;
  }

  mouseDown?: (index: number, e: MouseDownEvent) => boolean;
  dragStarted?: (index: number, e: DragStartEvent) => boolean;
  dragged?: (index: number, e: DragEvent) => boolean;
  dragEnded?: (index: number, e: DragEndEvent) => void;

  onMouseDown(e: MouseDownEvent): boolean {
    return this.mouseDown?.(this.index, e) ?? false;
  }

  onDragStart(e: DragStartEvent): boolean {
    return this.dragStarted?.(this.index, e) ?? false;
  }

  onDrag(e: DragEvent): boolean {
    return this.dragged?.(this.index, e) ?? false;
  }

  onDragEnd(e: DragEndEvent): boolean {
    this.dragEnded?.(this.index, e);
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
    default:
      return 0xCCCCCC;
  }
}
