import type { Vec2 } from "@osucad/framework";
import type { OsuHitObject } from "../../hitObjects";
import { OsuPlayfield } from "../../ui";
import { OsuOperatorUtils } from "./OsuOperatorUtils";

export type TransformOrigin =
  | { type: "custom", value: Vec2 }
  | { type: "selection" }
  | { type: "playfield" };

export namespace TransformOrigin
{
  export function evaluate(
    value: TransformOrigin,
    hitObjects: readonly OsuHitObject[],
  ): Vec2 | undefined
  {
    switch (value.type)
    {
    case "custom":
      return value.value;
    case "playfield":
      return OsuPlayfield.BOUNDS.center;
    case "selection":
      return OsuOperatorUtils.getBounds(hitObjects)?.center;
    }
  }

  export function custom(value: Vec2): TransformOrigin
  {
    return { type: "custom", value };
  }

  export function playfield(): TransformOrigin
  {
    return { type: "playfield" };
  }

  export function selection(): TransformOrigin
  {
    return { type: "selection" };
  }
}

