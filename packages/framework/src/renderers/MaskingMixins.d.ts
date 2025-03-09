declare global {
  namespace PixiMixins {
    interface RendererSystems {
      masking: import('./MaskingSystem').MaskingSystem;
    }

    interface RendererPipes {
      masking: import('./MaskingPipe').MaskingPipe;
    }
  }
}

export {};
