import { isMobile } from './pixi';

export class FrameworkEnvironment {
  get antialiasPreferred() {
    if (devicePixelRatio >= 2) {
      return false;
    }

    if (isMobile.any) {
      return false;
    }

    return true;
  }

  get webGpuSupported() {
    return 'gpu' in navigator && 'requestAdapter' in navigator.gpu;
  }
}
