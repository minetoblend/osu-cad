declare global
{
  namespace PixiMixins
  {
    interface RendererSystems
    {
      maskingUniforms: import("./MaskingUniformSystem").MaskingUniformSystem;
    }
  }
}
export {};
