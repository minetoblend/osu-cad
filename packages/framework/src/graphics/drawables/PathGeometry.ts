import { Buffer, BufferUsage, Geometry } from "pixi.js";

export class PathGeometry extends Geometry
{
  public constructor()
  {
    const positionBuffer = new Buffer({
      data: new Float32Array(),
      label: "attribute-mesh-positions",
      shrinkToFit: false,
      usage: BufferUsage.VERTEX | BufferUsage.COPY_DST,
    });

    const uvBuffer = new Buffer({
      data: new Float32Array(),
      label: "attribute-mesh-uvs",
      shrinkToFit: false,
      usage: BufferUsage.VERTEX | BufferUsage.COPY_DST,
    });

    const indexBuffer = new Buffer({
      data: new Uint32Array(),
      label: "index-mesh-buffer",
      shrinkToFit: false,
      usage: BufferUsage.INDEX | BufferUsage.COPY_DST,
    });

    super({
      attributes: {
        aPosition: {
          buffer: positionBuffer,
          format: "float32x3",
          stride: 3 * 4,
          offset: 0,
        },
        aUV: {
          buffer: uvBuffer,
          format: "float32x2",
          stride: 2 * 4,
          offset: 0,
        },
      },
      indexBuffer,
      topology: "triangle-list",
    });
  }

  public get positions()
  {
    return this.attributes.aPosition.buffer.data as Float32Array;
  }

  public set positions(value)
  {
    this.attributes.aPosition.buffer.data = value;
  }

  public get texCoords()
  {
    return this.attributes.aUV.buffer.data as Float32Array;
  }

  public set texCoords(value)
  {
    this.attributes.aUV.buffer.data = value;
  }

  public get indices(): Uint32Array
  {
    return this.indexBuffer.data as Uint32Array;
  }

  public set indices(value)
  {
    this.indexBuffer.data = value;
  }
}
