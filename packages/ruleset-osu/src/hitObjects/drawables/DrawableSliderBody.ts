import type { HitObjectSelectionEvent } from '@osucad/core';
import type { Container } from 'pixi.js';
import type { Slider } from '../Slider';
import { animate, DrawableHitObject, HitObjectSelectionManager, ISkinSource, SkinConfig } from '@osucad/core';
import { Bindable, Drawable, PIXIContainer, type ReadonlyDependencyContainer, resolved, Vec2 } from '@osucad/framework';

import { AlphaFilter, Color, CustomRenderPipe, Mesh, MeshGeometry } from 'pixi.js';
import { OsuSelectionManager } from '../../edit/OsuSelectionManager';
import { GeometryBuilder } from './GeometryBuilder';
import { SliderPathGeometry } from './SliderPathGeometry';
import { SliderShader } from './SliderShader';

let endCapGeometry: MeshGeometry | null = null;

// little workaround for a pixi bug
(CustomRenderPipe.prototype as any).updateRenderable = () => {};
(CustomRenderPipe.prototype as any).destroyRenderable = () => {};

export class DrawableSliderBody extends Drawable {
  constructor() {
    super();

    this.alwaysPresent = true;

    this.mesh = new Mesh({
      geometry: (this.geometry = new SliderPathGeometry({
        path: [
          new Vec2(),
          new Vec2(0, 0),
        ],
        radius: this.radius,
        expectedDistance: 0,
      })),
      shader: this.shader,
      blendMode: 'none',
    });

    endCapGeometry ??= generateEndCap();

    this.endCap = new Mesh({
      geometry: endCapGeometry!,
      shader: this.shader,
      blendMode: 'none',
    });

    this.startCap = new Mesh({
      geometry: endCapGeometry!,
      shader: this.shader,
      blendMode: 'none',
    });

    this.mesh.state.depthTest = true;
    this.endCap.state.depthTest = true;
    this.startCap.state.depthTest = true;

    this.#body.addChild(this.mesh, this.endCap, this.startCap);
  }

  @resolved(ISkinSource)
  skin!: ISkinSource;

  createDrawNode(): Container {
    return this.#body;
  }

  private readonly mesh: Mesh;
  private readonly endCap: Mesh;
  private readonly startCap: Mesh;
  private readonly geometry: SliderPathGeometry;
  private readonly shader = new SliderShader();

  snakeInEnabled = true;
  snakeOutEnabled = true;

  #hitObject?: Slider;

  selection?: OsuSelectionManager;

  set hitObject(hitObject) {
    if (hitObject === this.#hitObject)
      return;

    if (hitObject) {
      hitObject.path.invalidated.addListener(this.#invalidatePath, this);
      this.#pathIsInvalid = true;
    }
    if (this.#hitObject) {
      this.#hitObject.path.invalidated.removeListener(this.#invalidatePath);
    }
    this.#hitObject = hitObject;

    this.#updateSelection();
  }

  get hitObject() {
    return this.#hitObject;
  }

  #invalidatePath() {
    this.#pathIsInvalid = true;
    this.#updatePath();
  }

  get path() {
    return this.hitObject?.path;
  }

  get radius() {
    if (!this.hitObject)
      return 0;

    return this.hitObject.scale * 59 * 1.25;
  }

  #alphaFilter = new AlphaFilter({
    alpha: 1,
    resolution: devicePixelRatio,
  });

  readonly #body = new PIXIContainer({
    filters: [
      this.#alphaFilter,
    ],
  });

  override update() {
    super.update();

    this.#updatePath();
  }

  #updatePath() {
    if (!this.hitObject)
      return;

    const snakeInDuration = Math.min(
      this.hitObject.timeFadeIn * 0.5,
      this.hitObject.spanDuration,
      200,
    );

    let snakeInProgress = animate(
      this.time.current - this.hitObject.startTime,
      -this.hitObject.timePreempt,
      -this.hitObject.timePreempt + snakeInDuration,
      0,
      1,
    );

    if (!this.snakeInEnabled)
      snakeInProgress = 1.0;

    this.shader.snakeInProgress = snakeInProgress;

    const startPos = Vec2.zero();

    const endPos = this.hitObject.path.getPositionAt(
      snakeInProgress,
    );

    this.startCap.position.copyFrom(startPos);
    this.startCap.scale = this.radius;

    this.endCap.position.copyFrom(endPos);
    this.endCap.scale = this.radius;

    if (this.#pathIsInvalid) {
      const range = this.hitObject.path.getRange(
        0,
        this.hitObject.expectedDistance,
      );

      this.geometry.update(
        range.path,
        this.radius,
        this.hitObject.path.expectedDistance,
      );
    }

    this.#pathIsInvalid = false;
  }

  override dispose(isDisposing: boolean = true) {
    this.skin.sourceChanged.removeListener(this.#skinChanged, this);

    this.selection?.selectionChanged.addListener(this.#selectionChanged, this);

    super.dispose(isDisposing);
  }

  #pathIsInvalid = true;

  @resolved(DrawableHitObject, true)
  private drawableHitObject?: DrawableHitObject;

  readonly accentColor = new Bindable(new Color(0xFFFFFF));

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    const selection = dependencies.resolveOptional(HitObjectSelectionManager);
    if (selection instanceof OsuSelectionManager)
      this.selection = selection;

    this.accentColor.valueChanged.addListener(this.#updateColor, this);
    this.sliderTrackOverride.valueChanged.addListener(this.#updateColor, this);
    this.skin.sourceChanged.addListener(this.#skinChanged, this);
    this.#updateColor();
  }

  sliderTrackOverride = new Bindable<Color | null>(null);

  borderColor = new Bindable<Color | null>(null);

  #skinChanged() {
    this.sliderTrackOverride.value = this.skin.getConfig(SkinConfig.SliderTrackOverride);
    this.borderColor.value = this.skin.getConfig(SkinConfig.SliderBorder);

    this.#updateBorderColor();
  }

  #updateColor() {
    this.shader.comboColor = this.sliderTrackOverride.value ?? this.accentColor.value;
  }

  protected override loadComplete() {
    super.loadComplete();

    if (this.drawableHitObject)
      this.accentColor.bindTo(this.drawableHitObject.accentColor);

    this.selection?.selectionChanged.addListener(this.#selectionChanged, this);

    this.#skinChanged();
  }

  #selectionChanged(event: HitObjectSelectionEvent) {
    if (event.hitObject !== this.hitObject || !this.hitObject)
      return;

    this.#updateSelection();
  }

  #updateSelection() {
    if (!this.hitObject || !this.selection?.isSelected(this.hitObject)) {
      this.#bodySelected = false;
      this.#updateBorderColor();
      return;
    }

    const type = this.selection?.getSelectionType(this.hitObject);

    this.#bodySelected = type === 'body';
    this.#updateBorderColor();
  }

  #bodySelected = false;

  #borderColorOverride: Color | null = null;

  get borderColorOverride() {
    return this.#borderColorOverride;
  }

  set borderColorOverride(value: Color | null) {
    if (value === this.#borderColorOverride)
      return;

    this.#borderColorOverride = value;
    this.#updateBorderColor();
  }

  #updateBorderColor() {
    if (this.#bodySelected)
      this.shader.borderColor = 0xFF0000;
    else
      this.shader.borderColor = this.#borderColorOverride?.toNumber() ?? this.borderColor.value?.toNumber() ?? 0xFFFFFF;
  }

  override get alpha() {
    return this.#alphaFilter.alpha;
  }

  override set alpha(value) {
    this.#alphaFilter.alpha = value;
  }
}

function getJoinGeometryCount(thetaDiff: number) {
  const step = Math.PI / 24.0;

  const absThetaDiff = Math.abs(thetaDiff);

  const amountOfOuterPoints = Math.ceil(absThetaDiff / step) + 1;

  return {
    vertices: (amountOfOuterPoints + 1) * 3,
    indices: (amountOfOuterPoints - 1) * 3,
  };
}

function generateEndCap() {
  const { vertices, indices } = getJoinGeometryCount(Math.PI);
  const builder = new GeometryBuilder(vertices * 2, indices * 2, 1);
  builder.addJoin(Vec2.zero(), 0, Math.PI, 1);
  builder.addJoin(Vec2.zero(), Math.PI, Math.PI, 1);

  for (let i = 1; i < builder.uvs.length; i += 2) {
    builder.uvs[i] = -1;
  }

  return new MeshGeometry({
    positions: builder.vertices,
    indices: builder.indices,
    uvs: builder.uvs,
  });
}
