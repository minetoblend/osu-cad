import type { PointData, Renderer, System } from "pixi.js";
import { Point } from "pixi.js";
import { BatcherPipe, BindGroup, color32BitToUniform, ExtensionType, Matrix, Rectangle, RendererType, UniformGroup, type WebGPURenderer } from "pixi.js";
import type { OsucadBatcher } from "./OsucadBatcher";
import type { BatchShader } from "./shaders/BatchShader";

export type MaskingUniformGroup = UniformGroup<{
  uIsMasking: { value: number; type: "i32" };
  uCornerRadius: { value: number; type: "f32" };
  uCornerExponent: { value: number; type: "f32" };
  uToMaskingSpace: { value: Matrix; type: "mat3x3<f32>" };
  uMaskingRect: { value: Float32Array; type: "vec4<f32>" };
  uBorderThickness: { value: number; type: "f32" };
  uBorderColorAlpha: { value: Float32Array; type: "vec4<f32>" };
  uMaskingBlendRange: { value: number; type: "f32" };
}>;


export interface MaskingUniformOptions
{
  cornerRadius?: number;
  cornerExponent?: number;
  toMaskingSpace?: Matrix;
  maskingRect?: Rectangle;
  isMasking?: boolean;
  borderThickness?: number;
  borderColor?: number;
  maskingBlendRange?: number;
  offset?: PointData;
}

export interface MaskingUniformData
{
  bindGroup: BindGroup;
  cornerRadius: number;
  cornerExponent: number;
  toMaskingSpace: Matrix;
  maskingRect: Rectangle;
  isMasking: boolean;
  borderThickness: number;
  borderColor: number;
  maskingBlendRange: number;
  offset: PointData;
}

export class MaskingUniformSystem implements System
{
  public static extension = {
    type: [
      ExtensionType.WebGLSystem,
      ExtensionType.WebGPUSystem,
      ExtensionType.CanvasSystem,
    ],
    name: "maskingUniforms",
    priority: 100,
  } as const;

  private readonly _renderer: Renderer;

  private readonly _batcher: OsucadBatcher;
  private readonly _shader: BatchShader;

  private readonly _uniformsPool: MaskingUniformGroup[] = [];
  private readonly _activeUniforms: MaskingUniformGroup[] = [];

  private readonly _bindGroupPool: BindGroup[] = [];
  private readonly _activeBindGroups: BindGroup[] = [];

  private _currentMaskingUniformData!: MaskingUniformData;

  constructor(renderer: Renderer)
  {
    this._renderer = renderer;
    this._batcher = BatcherPipe.getBatcher("osucad") as OsucadBatcher;
    this._shader = this._batcher.shader;
  }

  private _stackIndex = 0;
  private _maskingUniformDataStack: MaskingUniformData[] = [];

  reset()
  {
    this._stackIndex = 0;

    for (let i = 0; i < this._activeUniforms.length; i++)
    {
      this._uniformsPool.push(this._activeUniforms[i]);
    }

    for (let i = 0; i < this._activeBindGroups.length; i++)
    {
      this._bindGroupPool.push(this._activeBindGroups[i]);
    }

    this._activeUniforms.length = 0;
    this._activeBindGroups.length = 0;
  }

  protected render()
  {
    this.start({});
  }

  public start(options: MaskingUniformOptions): void
  {
    this.reset();

    this.push(options);
  }

  public bind({
    cornerRadius,
    cornerExponent,
    toMaskingSpace,
    maskingRect,
    isMasking,
    borderThickness,
    borderColor,
    maskingBlendRange,
    offset,
  }: MaskingUniformOptions)
  {
    const renderTarget = this._renderer.renderTarget.renderTarget;

    const currentMaskingUniformData = this._stackIndex
        ? this._maskingUniformDataStack[this._stackIndex - 1]
        : {
          cornerRadius: 0,
          cornerExponent: 2.0,
          toMaskingSpace: new Matrix(),
          maskingRect: new Rectangle(),
          isMasking: false,
          borderThickness: 0,
          borderColor: 0,
          maskingBlendRange: 1,
          offset: new Point(),
        };

    const globalUniformData: MaskingUniformData = {
      bindGroup: null!,
      cornerRadius: cornerRadius ?? currentMaskingUniformData.cornerRadius,
      cornerExponent: cornerExponent ?? 2.0,
      toMaskingSpace: toMaskingSpace ?? currentMaskingUniformData.toMaskingSpace,
      maskingRect: maskingRect ?? new Rectangle(0, 0, renderTarget.width, renderTarget.height),
      isMasking: isMasking ?? currentMaskingUniformData.isMasking,
      borderThickness: borderThickness ?? currentMaskingUniformData.borderThickness,
      borderColor: borderColor ?? currentMaskingUniformData.borderColor,
      maskingBlendRange: maskingBlendRange ?? currentMaskingUniformData.maskingBlendRange,
      offset: offset || currentMaskingUniformData.offset,
    };

    const uniformGroup = this._uniformsPool.pop() || this._createUniforms();

    this._activeUniforms.push(uniformGroup);

    const uniforms = uniformGroup.uniforms;

    uniforms.uCornerRadius = globalUniformData.cornerRadius;
    uniforms.uCornerExponent = globalUniformData.cornerExponent;

    uniforms.uToMaskingSpace.copyFrom(globalUniformData.toMaskingSpace);

    uniforms.uToMaskingSpace.tx += globalUniformData.offset.x;
    uniforms.uToMaskingSpace.ty += globalUniformData.offset.y;

    uniforms.uMaskingRect[0] = globalUniformData.maskingRect.x;
    uniforms.uMaskingRect[1] = globalUniformData.maskingRect.y;
    uniforms.uMaskingRect[2] = globalUniformData.maskingRect.width;
    uniforms.uMaskingRect[3] = globalUniformData.maskingRect.height;

    uniforms.uIsMasking = globalUniformData.isMasking ? 1 : 0;
    uniforms.uBorderThickness = globalUniformData.borderThickness;
    uniforms.uMaskingBlendRange = globalUniformData.maskingBlendRange;


    color32BitToUniform(
        globalUniformData.borderColor,
        uniforms.uBorderColorAlpha,
        0,
    );

    uniformGroup.update();

    let bindGroup: BindGroup;

    if ((this._renderer as WebGPURenderer).renderPipes.uniformBatch)
    {
      bindGroup = (this._renderer as WebGPURenderer).renderPipes.uniformBatch.getUniformBindGroup(uniformGroup, false);
    }
    else
    {
      bindGroup = this._bindGroupPool.pop() || new BindGroup();
      this._activeBindGroups.push(bindGroup);
      bindGroup.setResource(uniformGroup, 0);
    }

    globalUniformData.bindGroup = bindGroup;

    this._currentMaskingUniformData = globalUniformData;

    this._shader.resources.maskingUniforms = uniformGroup;
  }

  public push(options: MaskingUniformOptions)
  {
    this.bind(options);

    this._maskingUniformDataStack[this._stackIndex++] = this._currentMaskingUniformData;
  }

  public pop()
  {
    this._currentMaskingUniformData = this._maskingUniformDataStack[--this._stackIndex - 1];

    // for webGL we need to update the uniform group here
    // as we are not using bind groups
    if (this._renderer.type === RendererType.WEBGL)
    {
      (this._currentMaskingUniformData.bindGroup.resources[0] as UniformGroup).update();
    }
  }

  get bindGroup(): BindGroup
  {
    return this._currentMaskingUniformData.bindGroup;
  }

  get maskingUniformData()
  {
    return this._currentMaskingUniformData;
  }

  get uniformGroup()
  {
    return this._currentMaskingUniformData.bindGroup.resources[0] as UniformGroup;
  }

  private _createUniforms(): MaskingUniformGroup
  {
    return new UniformGroup({
      uCornerRadius: { value: 0, type: "f32" },
      uCornerExponent: { value: 2.0, type: "f32" },
      uToMaskingSpace: { value: new Matrix(), type: "mat3x3<f32>" },
      uMaskingRect: { value: new Float32Array(4), type: "vec4<f32>" },
      uIsMasking: { value: 0, type: "i32" },
      uBorderThickness: { value: 0, type: "f32" },
      uBorderColorAlpha: { value: new Float32Array(4), type: "vec4<f32>" },
      uMaskingBlendRange: { value: 1, type: "f32" },
    }, {
      isStatic: true,
    });
  }

  public destroy()
  {
    (this._renderer as any) = null;
  }
}
