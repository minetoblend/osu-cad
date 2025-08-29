import type { ColorSource } from "pixi.js";
import { Color } from "pixi.js";

export class ColorUtils
{
  public static lighten(color: ColorSource, amount: number)
  {
    amount *= 0.5;
    color = new Color(color);

    return this.redistribute(new Color([
      Math.min(1.0, color.red * (1.0 + 0.5 * amount) + amount),
      Math.min(1.0, color.green * (1.0 + 0.5 * amount) + amount),
      Math.min(1.0, color.blue * (1.0 + 0.5 * amount) + amount),
      color.alpha,
    ]));
  }

  public static darken(color: ColorSource, amount: number)
  {
    amount *= 0.5;
    color = new Color(color);

    return this.redistribute(new Color([
      Math.max(0.0, color.red * (1.0 - 0.5 * amount) - amount),
      Math.max(0.0, color.green * (1.0 - 0.5 * amount) - amount),
      Math.max(0.0, color.blue * (1.0 - 0.5 * amount) - amount),
      color.alpha,
    ]));
  }

  public static darkenSimple(color: ColorSource, amount: number)
  {
    color = new Color(color);

    amount = 1 / (1 + amount);

    return new Color([
      color.red * amount,
      color.green * amount,
      color.blue * amount,
      color.alpha,
    ]);
  }

  public static redistribute(color: Color)
  {
    const m = Math.max(color.red, color.green, color.blue);
    if (m <= 1)
      return color;

    const total = color.red + color.green + color.blue;

    if (total >= 3)
      return (new Color(0xFFFFFF));

    const x = (3 - total) / (3 * m - total);
    const gray = 1 - x * m;

    return new Color([
      gray + x * color.red,
      gray + x * color.green,
      gray + x * color.blue,
      color.alpha,
    ]);
  }

  public static getLuminosity(color: ColorSource)
  {
    color = new Color(color);

    return Math.sqrt(color.red * color.red * 0.299 + color.green * color.green * 0.587 + color.blue * color.blue * 0.114);
  }
}
