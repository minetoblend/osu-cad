import type { ReadonlyDependencyContainer } from '../di/DependencyContainer';
import type { Drawable } from '../graphics/drawables/Drawable';
import type { Vec2 } from '../math';
import type { MouseMoveEvent } from './events/MouseMoveEvent';
import { Container } from '../graphics/containers/Container';
import { Visibility, VisibilityContainer } from '../graphics/containers/VisibilityContainer';
import { Axes } from '../graphics/drawables/Axes';
import { Graphics } from 'pixi.js';

export class CursorContainer extends VisibilityContainer {
  constructor() {
    super();
    this.depth = -Number.MAX_VALUE;
    this.relativeSizeAxes = Axes.Both;

    this.state.value = Visibility.Visible;
  }

  createCursor(): Drawable {
    return new Cursor();
  }

  protected activeCursor!: Drawable;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.add(this.activeCursor = this.createCursor());
  }

  override popIn() {
    this.alpha = 1;
  }

  override popOut() {
    this.alpha = 0;
  }

  override onMouseMove(e: MouseMoveEvent): boolean {
    this.activeCursor.position = e.mousePosition;
    return super.onMouseMove?.(e) ?? false;
  }

  override receivePositionalInputAt(pos: Vec2): boolean {
    return true;
  }

  override receivePositionalInputAtLocal(localPosition: Vec2): boolean {
    return true;
  }
}

class Cursor extends Container {
  override loadComplete() {
    super.loadComplete();

    const g = new Graphics();

    g.circle(0, 0, 4).fill({ color: 0xFFFFFF }).stroke({
      color: 'rgb(247, 99, 164)',
      width: 2,
      alignment: 1,
    });

    this.drawNode.addChild(g);
  }
}
