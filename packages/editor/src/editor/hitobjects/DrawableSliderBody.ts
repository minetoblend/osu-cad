import type { Container } from 'pixi.js';
import type { Slider } from '../../beatmap/hitObjects/Slider';
import { Bindable, dependencyLoader, Drawable, PIXIContainer, resolved, Vec2 } from 'osucad-framework';
import { AlphaFilter, Color, CustomRenderPipe, Mesh, MeshGeometry } from 'pixi.js';
import { SliderSelectionType } from '../../beatmap/hitObjects/SliderSelection';
import { ISkinSource } from '../../skinning/ISkinSource.ts';
import { SkinConfig } from '../../skinning/SkinConfig.ts';
import { animate } from '../../utils/animate';
import { ThemeColors } from '../ThemeColors';
import { DrawableHitObject } from './DrawableHitObject';
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

  set hitObject(hitObject) {
    if (hitObject === this.#hitObject)
      return;

    if (hitObject) {
      hitObject.path.invalidated.addListener(this.#invalidatePath, this);
      hitObject.subSelection.changed.addListener(this.#updateSelection, this);
      this.#pathIsInvalid = true;
    }
    if (this.#hitObject) {
      this.#hitObject.path.invalidated.removeListener(this.#invalidatePath);
      this.#hitObject.subSelection.changed.removeListener(this.#updateSelection);
    }
    this.#hitObject = hitObject;

    this.#updateSelection();
  }

  get hitObject() {
    return this.#hitObject;
  }

  #invalidatePath() {
    this.#pathIsInvalid = true;
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
  });

  readonly #body = new PIXIContainer({
    filters: [
      this.#alphaFilter,
    ],
  });

  @resolved(ThemeColors)
  colors!: ThemeColors;

  update() {
    super.update();

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

    if (!this.snakeInEnabled) {
      snakeInProgress = 1.0;
    }

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

    this.snakeInProgress = snakeInProgress;
    this.#pathIsInvalid = false;
  }

  dispose(isDisposing: boolean = true) {
    this.skin.sourceChanged.removeListener(this.#skinChanged, this);

    super.dispose(isDisposing);
  }

  #pathIsInvalid = true;

  snakeInProgress = 0;

  @resolved(DrawableHitObject)
  private drawableHitObject!: DrawableHitObject;

  private accentColor = new Bindable(new Color(0xFFFFFF));

  @dependencyLoader()
  load() {
    this.accentColor.valueChanged.addListener(this.#updateColor, this);
    this.sliderTrackOverride.valueChanged.addListener(this.#updateColor, this);
    this.skin.sourceChanged.addListener(this.#skinChanged, this);
  }

  sliderTrackOverride = new Bindable<Color | null>(null);

  borderColor = new Bindable<Color | null>(null);

  #skinChanged() {
    this.sliderTrackOverride.value = this.skin.getConfig(SkinConfig.SliderTrackOverride)?.value ?? null;
    this.borderColor.value = this.skin.getConfig(SkinConfig.SliderBorder)?.value ?? null;

    this.#updateBorderColor();
  }

  #updateColor() {
    const color = this.sliderTrackOverride.value ?? this.accentColor.value;

    this.shader.comboColor = new Color(color).setAlpha(0.8);
  }

  protected loadComplete() {
    super.loadComplete();

    this.accentColor.bindTo(this.drawableHitObject.accentColor);

    this.#skinChanged();
  }

  #selected = false;

  get selected() {
    return this.#selected;
  }

  set selected(value: boolean) {
    if (this.#selected === value)
      return;

    this.#selected = value;

    this.#updateBorderColor();
  }

  #updateBorderColor() {
    this.shader.borderColor = this.selected ? 0xFF0000 : this.borderColor.value?.toNumber() ?? 0xFFFFFF;
  }

  #updateSelection() {
    if (!this.hitObject) {
      this.selected = false;
      return;
    }
    this.selected = this.hitObject!.subSelection.type === SliderSelectionType.Body;
  }

  get alpha() {
    return this.#alphaFilter.alpha;
  }

  set alpha(value) {
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
