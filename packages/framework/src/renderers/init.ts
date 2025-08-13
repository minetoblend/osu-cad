import { Batcher, isMobile, RenderTarget, Filter, DynamicBitmapFont, GlobalUniformSystem, extensions, getMaxTexturesPerBatch, GraphicsPipe, GraphicsContextSystem, FilterPipe, FilterSystem, MeshPipe } from "pixi.js";
import { OsucadBatcher } from "./OsucadBatcher";
import { OsucadSpritePipe } from "./OsucadSpritePipe";
import { MaskingPipe } from "./MaskingPipe";
import { MaskingSystem } from "./MaskingSystem";
import { OsucadUniformSystem } from "./OsucadUniformSystem";
import { SpriteTextPipe } from "../graphics/text/SpriteTextPipe";

if (isMobile.any)
  Batcher.defaultOptions.maxTextures = Math.min(16, getMaxTexturesPerBatch());

RenderTarget.defaultOptions.depth = true;
RenderTarget.defaultOptions.stencil = true;
Filter.defaultOptions.resolution = devicePixelRatio;
Filter.defaultOptions.antialias = "inherit";
DynamicBitmapFont.defaultOptions.textureSize = 1024;
DynamicBitmapFont.defaultOptions.padding = 6;

extensions.remove(GlobalUniformSystem);
extensions.add(
    OsucadBatcher,
    OsucadSpritePipe,
    MaskingPipe,
    MaskingSystem,
    OsucadUniformSystem,
    SpriteTextPipe,
    GraphicsPipe,
    GraphicsContextSystem,
    FilterSystem,
    FilterPipe,
    MeshPipe,
);
