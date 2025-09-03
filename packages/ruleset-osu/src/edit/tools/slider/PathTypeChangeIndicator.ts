import type { ColorSource } from "pixi.js";
import { Color } from "pixi.js";
import { Anchor, Axes, Box, ColorUtils, CompositeDrawable, SpriteText, Vec2 } from "@osucad/framework";
import { PathType } from "../../../hitObjects";
import { SliderPathVisualizer } from "./SliderPathVisualizer";

export class PathTypeChangeIndicator extends CompositeDrawable
{
  readonly #text: SpriteText;
  readonly #background: Box;

  public constructor()
  {
    super();

    this.origin = Anchor.BottomLeft;
    this.autoSizeAxes = Axes.Both;
    this.masking = true;
    this.cornerRadius = 3;
    this.alpha = 0;

    this.internalChildren = [
      this.#background = new Box({
        relativeSizeAxes: Axes.Both,
      }),
      this.#text = new SpriteText({
        margin: 3,
        style: {
          fill: 0xffffff,
          fontSize: 16,
        },
      }),
    ];
  }

  public get text()
  {
    return this.#text.text;
  }

  public set text(value)
  {
    this.#text.text = value;
  }

  public set accentColor(value: ColorSource)
  {
    this.#background.color = value;
  }

  public flashPathType(type: PathType, screenSpacePosition: Vec2)
  {
    switch (type)
    {
    case PathType.PerfectCurve:
      this.text = "Perfect Curve";
      break;
    case PathType.BSpline:
      this.text = "B-Spline";
      break;
    default:
      this.text = PathType[type];
      break;
    }


    this.position = this.parent!.toLocalSpace(screenSpacePosition).add(new Vec2(5, -5));
    this.fadeOutFromOne(750);

    this.accentColor = ColorUtils.darken(new Color(SliderPathVisualizer.getColor(type)), 0.2);
  }
}
