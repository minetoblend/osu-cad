import {AlphaFilter} from "pixi.js";
import {ObjectPool} from "./objectPool.ts";

export const alphaFilterPool = new ObjectPool(
  () => new AlphaFilter(),
  20,
  filter => {
    filter.destroy();
  },
);