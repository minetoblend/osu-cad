import {Effect, extensions} from "pixi.js";
import {DepthTestPipe} from "@/editor/drawables/hitObjects/slider/DepthTestPipe.ts";

export class DepthTestEffect implements Effect {
  priority = 0;
  pipe = 'depthTest';

  destroy(): void {
  }

}

extensions.add(DepthTestPipe)