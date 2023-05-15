import { IHitArea } from "pixi.js";

export const globalHitArea: IHitArea = {
  contains(x: number, y: number) {
    return true;
  },
};
