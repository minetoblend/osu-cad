import { ContainerDrawable } from '../../framework/drawable/ContainerDrawable.ts';
import { Mesh, MeshGeometry, RenderContainer, WebGLRenderer } from 'pixi.js';
import { SliderPathGeometry } from '../../editorOld/drawables/hitObjects/SliderPathGeometry.ts';
import { SliderShader } from '../../editorOld/drawables/hitObjects/sliderShader.ts';
import { Beatmap, Slider, Vec2 } from '@osucad/common';
import { GeometryBuilder } from '../../editorOld/drawables/hitObjects/GeometryBuilder.ts';
import { animate } from '../../editorOld/drawables/animate.ts';
import { resolved } from '../../framework/di/DependencyLoader.ts';
import { EditorClock } from '../EditorClock.ts';

let endCapGeometry: MeshGeometry | null = null;

export class DrawableSliderBody extends ContainerDrawable {
  constructor(readonly hitObject: Slider) {
    super();

    this.mesh = new Mesh({
      geometry: (this.geometry = new SliderPathGeometry({
        path: hitObject.path.calculatedRange,
        radius: this.radius,
        expectedDistance: hitObject.path.expectedDistance,
      })),
      shader: this.shader,
    });

    endCapGeometry ??= generateEndCap();

    this.endCap = new Mesh({
      geometry: endCapGeometry!,
      shader: this.shader,
    });

    this.mesh.state.depthTest = true;
    this.endCap.state.depthTest = true;
    this.drawNode.addChild(this.body);
  }

  private readonly mesh: Mesh;
  private readonly endCap: Mesh;
  private readonly geometry: SliderPathGeometry;
  private readonly shader = new SliderShader();

  snakingSlidersEnabled = true;

  get path() {
    return this.hitObject.path;
  }

  get radius() {
    return this.hitObject.scale * 60 * 1.25;
  }

  private readonly body = new RenderContainer({
    render: (renderer) => {
      if (renderer instanceof WebGLRenderer) {
        const gl = renderer.gl;

        const endPos = this.hitObject.stackedPosition.add(
          this.hitObject.path.getPositionAtDistance(
            this.shader.snakeInProgress * this.hitObject.expectedDistance,
          ),
        );

        this.mesh.groupTransform
          .identity()
          .append(this.drawNode.groupTransform);
        this.endCap.groupTransform
          .identity()
          .scale(this.radius, this.radius)
          .translate(endPos.x, endPos.y);

        gl.clearDepth(1);
        gl.clear(gl.DEPTH_BUFFER_BIT);

        gl.colorMask(false, false, false, false);

        renderer.renderPipes.mesh.execute({
          renderPipeId: 'mesh',
          mesh: this.mesh,
          canBundle: false,
        });

        renderer.renderPipes.mesh.execute({
          renderPipeId: 'mesh',
          mesh: this.endCap,
          canBundle: false,
        });

        gl.colorMask(true, true, true, true);
        gl.depthFunc(gl.EQUAL);

        renderer.renderPipes.mesh.execute({
          renderPipeId: 'mesh',
          mesh: this.mesh,
          canBundle: false,
        });

        renderer.renderPipes.mesh.execute({
          renderPipeId: 'mesh',
          mesh: this.endCap,
          canBundle: false,
        });

        gl.depthFunc(gl.LESS);
      }
    },
  });

  @resolved(EditorClock)
  clock!: EditorClock;

  @resolved(Beatmap)
  beatmap!: Beatmap;

  pathVersion = -1;

  setup() {
    const comboColors = this.beatmap.colors;
    this.shader.comboColor =
      comboColors[this.hitObject.comboIndex % comboColors.length];
    this.shader.borderColor = this.hitObject.isSelected ? 0x3d74ff : 0xffffff;
  }

  onTick() {
    if (
      this.clock.currentTimeAnimated <
        this.hitObject.startTime - this.hitObject.timePreempt ||
      this.clock.currentTimeAnimated > this.hitObject.endTime + 700
    ) {
      this.alpha = 0;
      return;
    }
    const snakeInDuration = Math.min(
      this.hitObject.timeFadeIn * 0.5,
      this.hitObject.spanDuration,
      200,
    );

    let snakeInProgress = animate(
      this.clock.currentTimeAnimated - this.hitObject.startTime,
      -this.hitObject.timePreempt,
      -this.hitObject.timePreempt + snakeInDuration,
      0,
      1,
    );

    if (!this.snakingSlidersEnabled) {
      snakeInProgress = 1.0;
    }

    this.shader.snakeInProgress = snakeInProgress;

    if (this.pathVersion !== this.hitObject.path.version) {
      const path = this.hitObject.path.getRange(
        0,
        this.hitObject.expectedDistance,
      );

      this.geometry.update(
        path,
        this.radius,
        this.hitObject.path.expectedDistance,
      );
    }

    this.snakeInProgress = snakeInProgress;
    this.pathVersion = this.hitObject.path.version;
  }

  snakeInProgress = 0;

  get alpha() {
    return this.shader.alpha;
  }

  set alpha(value: number) {
    this.shader.alpha = value;
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
  return new MeshGeometry({
    positions: builder.vertices,
    indices: builder.indices,
    uvs: builder.uvs,
  });
}
