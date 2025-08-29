import { isMobile } from "pixi.js";

export class FrameworkEnvironment
{
  public get antialiasPreferred()
  {
    if (devicePixelRatio >= 2)
      return false;

    if (isMobile.any)
      return false;

    if (navigator.userAgent.includes("Mac"))
      return false;

    return true;
  }

  public get webGpuSupported()
  {
    return "gpu" in navigator && "requestAdapter" in navigator.gpu;
  }
}
