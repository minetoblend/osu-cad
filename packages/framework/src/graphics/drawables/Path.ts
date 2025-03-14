import type { ReadonlyDependencyContainer } from '../../di/DependencyContainer';

import type { Vec2 } from '../../math/Vec2';
import type { PIXIContainer } from '../../pixi';
import { AlphaFilter, Mesh } from 'pixi.js';
import { Cached } from '../../caching/Cached';
import { Line } from '../../math/Line';
import { Drawable } from './Drawable';
import { PathGeometry } from './PathGeometry';
import { PathGeometryBuilder } from './PathGeometryBuilder';
import { PathShader } from './PathShader';

export class Path extends Drawable {
  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.#mesh.state.depthTest = true;
  }

  #vertices: readonly Vec2[] = [];

  get vertices() {
    return this.#vertices;
  }

  set vertices(value) {
    this.#vertices = value;
    this.#segmentsCache.invalidate();
  }

  readonly #segmentsBacking: Line[] = [];
  readonly #segmentsCache = new Cached();

  get #segments() {
    return this.#segmentsCache.isValid ? this.#segmentsBacking : this.#generateSegments();
  }

  #generateSegments(): Line[] {
    this.#segmentsBacking.length = Math.max(0, this.vertices.length - 1);

    if (this.#vertices.length > 1) {
      for (let i = 0; i < this.#vertices.length - 1; ++i)
        this.#segmentsBacking[i] = new Line(this.#vertices[i], this.#vertices[i + 1]);
    }

    const { positions, texCoords, indices } = new PathGeometryBuilder(
      this.pathRadius,
      this.#segmentsBacking,
    ).build();

    this.#geometry.positions = new Float32Array(positions);
    this.#geometry.texCoords = new Float32Array(texCoords);
    this.#geometry.indices = new Uint32Array(indices);

    this.#segmentsCache.validate();
    return this.#segmentsBacking;
  }

  get texture() {
    return this.#pathShader.texture;
  }

  set texture(value) {
    if (this.texture === value)
      return;

    this.#pathShader.texture = value;
  }

  #pathRadius = 10;

  get pathRadius() {
    return this.#pathRadius;
  }

  set pathRadius(value) {
    if (this.#pathRadius === value)
      return;
    this.#pathRadius = value;

    this.#segmentsCache.invalidate();
  }

  readonly #geometry = new PathGeometry();

  readonly #pathShader = new PathShader();

  readonly #alphaFilter = new AlphaFilter();

  readonly #mesh = new Mesh({
    geometry: this.#geometry,
    shader: this.#pathShader,
    blendMode: 'none',
    filters: this.#alphaFilter,
  });

  protected override createDrawNode(): PIXIContainer {
    return this.#mesh;
  }

  override updateSubTreeTransforms(): boolean {
    if (!super.updateSubTreeTransforms())
      return false;

    if (!this.#segmentsCache.isValid)
      this.#generateSegments();

    return true;
  }
}
