import type { Bindable } from "@osucad/framework";
import type { TestScene } from "./TestScene";

export interface TestSceneWrapper
{
  default: {
    scene: Bindable<(new () => TestScene) | undefined>
  }
}

