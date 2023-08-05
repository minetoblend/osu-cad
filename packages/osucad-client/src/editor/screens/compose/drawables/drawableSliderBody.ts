import { Ref, reactive, ref, watch } from "vue";
import { SliderMaterial } from "./sliderMaterial";
import { SliderTextureResource } from "./sliderTextureResource";
import { SliderPath } from "@osucad/common";
import {
  BLEND_MODES,
  BaseTexture,
  Bounds,
  Container,
  DRAW_MODES,
  Geometry,
  MSAA_QUALITY,
  Matrix,
  Mesh,
  RenderTexture,
  Renderer,
  Sprite,
  Texture,
} from "pixi.js";
import { createSliderGeometry } from "./sliderGeometry";
import { MaybeComputedRef, resolveUnref } from "@vueuse/core";
import { SliderGeometrySource } from "./sliderGeometrySource";

export class DrawableSliderBody extends Container {
  private renderTexture?: RenderTexture;
  private geo: Geometry;
  private textureResource: SliderTextureResource;
  private material: SliderMaterial;
  private mesh: Mesh<SliderMaterial>;
  private sprite: Sprite;

  private readonly renderTransform = new Matrix();

  constructor(
    private readonly geoSource: SliderGeometrySource,
    private readonly viewportScale: Readonly<Ref<number>>
  ) {
    super();

    this.geo = new Geometry();
    this.geo.addAttribute("aVertexPosition", []);
    this.geo.addIndex([]);

    this.textureResource = new SliderTextureResource();
    const texture = new BaseTexture(this.textureResource);

    this.material = new SliderMaterial(new Texture(texture));

    this.mesh = new Mesh(
      this.geo,
      this.material,
      undefined,
      DRAW_MODES.TRIANGLES
    );
    this.mesh.state.blendMode = BLEND_MODES.NONE;

    this.sprite = new Sprite(this.renderTexture);

    this.addChild(this.sprite);

    this.updateGeometry();

    watch(this.viewportScale, () => this.updateGeometry());
  }

  set tint(tint: number) {
    if (this.textureResource.tint === tint) return;
    this.textureResource.tint = tint;
    this.textureResource.update();
    this._needsRender = true;
  }

  set outlineTint(tint: number) {
    if (this.textureResource.outlineColor === tint) return;
    this.textureResource.outlineColor = tint;
    this.textureResource.update();
    this._needsRender = true;
  }

  set outlineOnly(outlineOnly: boolean) {
    this.textureResource.outlineOnly = outlineOnly;
  }

  _needsRender = true;
  _needsGeometryUpdate = true;

  updateGeometry(): void {
    const geo = this.geoSource.getGeometry();

    this.geo.indexBuffer.update(geo.indices);
    this.geo.getBuffer("aVertexPosition").update(geo.vertices);

    this.updateTexture();

    this._needsRender = true;
    this._needsGeometryUpdate = false;
  }

  nearestPow2(value: number) {
    return Math.pow(2, Math.ceil(Math.log(value) / Math.log(2)));
  }

  updateTexture(): void {
    const radiusWithShadow = resolveUnref(this.geoSource.radius) / 0.75;
    const padding = 10;

    const bounds = new Bounds();
    bounds.addBounds(this.geoSource.getBounds());

    bounds.minX = Math.max(bounds.minX, -1000);
    bounds.minY = Math.max(bounds.minY, -1000);
    bounds.maxX = Math.min(bounds.maxX, 512 + 1000);
    bounds.maxY = Math.min(bounds.maxY, 384 + 1000);

    bounds.pad(radiusWithShadow);

    let textureWidth =
      (bounds.maxX - bounds.minX) * this.viewportScale.value + padding * 2;
    let textureHeight =
      (bounds.maxY - bounds.minY) * this.viewportScale.value + padding * 2;

    textureWidth = Math.max(textureWidth, 1024)
    textureHeight =  Math.max(textureHeight, 1024)

    textureWidth = this.nearestPow2(textureWidth);
    textureHeight = this.nearestPow2(textureHeight);    

    if (
      textureWidth <= 0 ||
      textureHeight <= 0 ||
      isNaN(textureWidth) ||
      isNaN(textureHeight)
    ) {
      this.sprite.visible = false;
      return;
    } else {
      this.sprite.visible = true;
    }

    if (!this.renderTexture) {
      this.renderTexture = RenderTexture.create({
        width: textureWidth,
        height: textureHeight,
        multisample: MSAA_QUALITY.NONE,
      });
      this.renderTexture.framebuffer.addDepthTexture();
      this.renderTexture.framebuffer.enableDepth();
      this.sprite.texture = this.renderTexture;
    }
    if (
      this.renderTexture.width !== textureWidth ||
      this.renderTexture.height !== textureHeight
    ) {
      // console.log("resize", textureWidth, textureHeight);
      console.log(textureWidth, textureHeight, this.renderTexture.framebuffer);
      this.renderTexture.resize(textureWidth, textureHeight, true);

      // console.log(this.renderTexture.valid);
    }

    this.renderTransform
      .identity()
      .translate(-bounds.minX, -bounds.minY)
      .scale(this.viewportScale.value, this.viewportScale.value)
      .translate(padding, padding);

    this.sprite.position.set(
      -padding / this.viewportScale.value + bounds.minX,
      -padding / this.viewportScale.value + bounds.minY
    );
    this.sprite.scale.set(1 / this.viewportScale.value);
  }

  override render(renderer: Renderer): void {
    if (this._needsRender) {
      const cachedRenderTexture = renderer.renderTexture.current;
      const cachedSourceFrame = renderer.renderTexture.sourceFrame.clone();
      const cachedDestinationFrame =
        renderer.renderTexture.destinationFrame.clone();
      const cachedProjectionTransform = renderer.projection.transform;

      renderer.batch.flush();

      renderer.gl.enable(renderer.gl.DEPTH_TEST);
      renderer.render(this.mesh, {
        renderTexture: this.renderTexture,
        clear: true,
        transform: this.renderTransform,
      });
      renderer.gl.disable(renderer.gl.DEPTH_TEST);
      renderer.framebuffer.blit();

      renderer.projection.transform = cachedProjectionTransform;
      renderer.renderTexture.bind(
        cachedRenderTexture!,
        cachedSourceFrame,
        cachedDestinationFrame
      );

      this._needsRender = false;
    }

    super.render(renderer);
  }
}
