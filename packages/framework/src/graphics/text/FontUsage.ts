export interface FontUsageOptions
{
  size?: number
  weight?: string
  italics?: boolean
  fixedWidth?: boolean
}

export class FontUsage
{
  public static readonly defaultOptions = {
    size: 20,
    italics: false,
    fixedWidth: false,
  } satisfies FontUsageOptions;

  public static readonly Default = new FontUsage(null);

  public readonly size: number;

  public readonly weight: string | null;

  public readonly italics: boolean;

  public readonly fixedWidth: boolean;

  public readonly fontName: string;

  public constructor(
    public readonly family: string | null = null,
    options: FontUsageOptions = {},
  )
  {
    const {
      size,
      weight,
      italics,
      fixedWidth,
    } = {
      ...FontUsage.defaultOptions,
      ...options,
    };

    this.size = size;
    this.weight = weight ?? null;
    this.italics = italics;
    this.fixedWidth = fixedWidth;

    let fontName = family + "-";
    if (weight !== undefined)
      fontName += weight;
    if (italics)
      fontName += "Italic";

    this.fontName = fontName.endsWith("-") ? fontName.substring(0, fontName.length - 1) : fontName;
  }
}
