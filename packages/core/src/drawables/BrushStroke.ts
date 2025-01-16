import type { PIXIContainer, Vec2 } from '@osucad/framework';
import { Cached, Drawable } from '@osucad/framework';
import { Mesh } from 'pixi.js';
import { zipWithNext } from '../utils/arrayUtils';
import { BrushStrokeGeometry, StrokePoint } from './BrushStrokeGeometry';

export class BrushStroke extends Drawable {
  constructor(points: StrokePoint[] = []) {
    super();

    const geometry = this.#geometry = new BrushStrokeGeometry({
      points,
    });

    this.#mesh = new Mesh({
      geometry,
    });
  }

  get radiusOffset() {
    return this.#geometry.radiusOffset;
  }

  set radiusOffset(value) {
    this.#geometry.radiusOffset = value;
  }

  readonly #geometry: BrushStrokeGeometry;
  readonly #mesh: Mesh;

  override createDrawNode(): PIXIContainer {
    return this.#mesh;
  }

  get points() {
    return this.#geometry.points;
  }

  #geometryBacking = new Cached();

  set points(value) {
    this.#geometry.points = value;
    this.#geometryBacking.invalidate();
  }

  addPoint(position: Vec2, radius: number) {
    this.#geometry.points.push(new StrokePoint(position, radius));
    this.#geometryBacking.invalidate();
  }

  setLastPoint(position: Vec2, radius: number) {
    if (this.#geometry.points.length === 0) {
      this.addPoint(position, radius);
      return;
    }

    this.#geometry.points[this.#geometry.points.length - 1] = new StrokePoint(position, radius);
    this.#geometryBacking.invalidate();
  }

  get lastPoint() {
    return this.#geometry.points[this.#geometry.points.length - 1];
  }

  override updateSubTreeTransforms(): boolean {
    if (!this.#geometryBacking.isValid) {
      this.#geometry.update();
      this.#geometryBacking.validate();
    }

    return super.updateSubTreeTransforms();
  }

  override receivePositionalInputAt(screenSpacePosition: Vec2): boolean {
    const position = this.toLocalSpace(screenSpacePosition);

    for (const [curr, next] of zipWithNext(this.points)) {
      const distance = curr.position.distance(position);

      const radius = Math.max(curr.radius, 10);

      if (distance < curr.radius)
        return true;

      const stepSize = distance / 2;

      if (curr.position.distance(next) < stepSize)
        continue;

      for (let travelDistance = stepSize; travelDistance < distance; travelDistance += stepSize) {
        const pos = curr.position.lerp(next.position, (travelDistance / distance));
        if (pos.distance(position) < radius)
          return true;
      }
    }

    return false;
  }
}
