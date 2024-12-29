import type { Graphics } from 'pixi.js';
import { dependencyLoader, resolved, Vec2 } from 'osucad-framework';
import { GraphicsDrawable } from '../../../../../drawables/GraphicsDrawable';
import { ThemeColors } from '../../../../ThemeColors';

export class DragLine extends GraphicsDrawable {
  constructor() {
    super();
  }

  @resolved(ThemeColors)
  colors!: ThemeColors;

  @dependencyLoader()
  load() {
    this.color = this.colors.translucent;
    this.alpha = 0.5;
  }

  get startPosition() {
    return this.#startPosition;
  }

  set startPosition(value) {
    if (this.#startPosition.equals(value))
      return;

    this.#startPosition = value;
    this.invalidateGraphics();
  }

  #startPosition = new Vec2();

  get endPosition() {
    return this.#endPosition;
  }

  set endPosition(value) {
    if (this.#endPosition.equals(value))
      return;

    this.#endPosition = value;
    this.invalidateGraphics();
  }

  #endPosition = new Vec2();

  updateGraphics(g: Graphics) {
    g.clear();

    if (this.startPosition.equals(this.endPosition))
      return;

    g.moveTo(this.startPosition.x, this.startPosition.y);

    const direction = this.endPosition.sub(this.startPosition).normalize();
    let pos = this.startPosition.clone();

    let distance = 0;
    const dashDistance = 5;

    const totalDistance = this.startPosition.distance(this.endPosition);

    while (distance < totalDistance) {
      distance = Math.min(distance + dashDistance, totalDistance);
      pos = this.startPosition.add(direction.scale(distance));
      g.lineTo(pos.x, pos.y);
      distance += dashDistance;
      pos = this.startPosition.add(direction.scale(distance));
      g.moveTo(pos.x, pos.y);
    }

    g.stroke({
      width: 1,
      color: 0xFFFFFF,
    });
  }

  clear() {
    this.endPosition = this.startPosition;
  }
}
