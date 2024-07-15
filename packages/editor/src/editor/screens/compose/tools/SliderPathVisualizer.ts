import type { Slider } from '@osucad/common';
import { PathType } from '@osucad/common';
import type {
  DragEndEvent,
  DragEvent,
  DragStartEvent,
  MouseDownEvent,
} from 'osucad-framework';
import {
  Anchor,
  Axes,
  CompositeDrawable,
  Container,
  PIXIGraphics,
  RoundedBox,
  Vec2,
  dependencyLoader,
} from 'osucad-framework';
import gsap from 'gsap';

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
      this.#slider.onUpdate.removeListener(this.#onSliderUpdate);
    }

    this.#slider = slider;
    this.#pathVersion = -1;

    slider?.onUpdate.addListener(this.#onSliderUpdate);

    if (slider) {
      this.#setup(slider);
    }
    else {
      this.#graphics.clear();
      this.#handles.clear();
    }
  }

  #pathVersion = -1;

  #graphics = new PIXIGraphics();

  @dependencyLoader()
  load() {
    this.drawNode.addChild(this.#graphics);

    this.addInternal(this.#handles);
  }

  #onSliderUpdate = () => {
    console.assert(this.#slider !== null, 'Slider should not be null');
    this.#setup(this.#slider!);
  };

  update() {
    super.update();

    if (this.#slider && this.#slider.path.version !== this.#pathVersion) {
      this.#updatePath(this.#slider);
      this.#pathVersion = this.#slider.path.version;
    }
  }

  #setup(slider: Slider) {
    this.position = slider.stackedPosition;
  }

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
      (this.#shadow = new RoundedBox({
        relativeSizeAxes: Axes.Both,
        size: 0.8,
        anchor: Anchor.Center,
        origin: Anchor.Center,
        cornerRadius: 5,
        color: 0x000000,
        alpha: 0.1,
      })),
      (this.#handle = new RoundedBox({
        relativeSizeAxes: Axes.Both,
        size: 0.6,
        anchor: Anchor.Center,
        origin: Anchor.Center,
        cornerRadius: 5,
      })),
    );

    this.type = type;
  }

  #shadow!: RoundedBox;
  #handle!: RoundedBox;

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
    gsap.to(this.#shadow, {
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 0.2,
      ease: 'back.out',
    });
    gsap.to(this.#handle, {
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 0.2,
      ease: 'back.out',
    });

    return true;
  }

  onHoverLost(): boolean {
    gsap.to(this.#shadow, {
      scaleX: 1,
      scaleY: 1,
      duration: 0.2,
      ease: 'back.out',
    });
    gsap.to(this.#handle, {
      scaleX: 1,
      scaleY: 1,
      duration: 0.2,
      ease: 'back.out',
    });

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
