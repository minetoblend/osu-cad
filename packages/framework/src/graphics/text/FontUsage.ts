export interface FontUsageOptions
{
  size?: number
  weight?: string
  italics?: boolean
  fixedWidth?: boolean
}

export class FontUsage
{
  static readonly defaultOptions = {
    size: 20,
    italics: false,
    fixedWidth: false,
  } satisfies FontUsageOptions;

  static readonly Default = new FontUsage(null);

  readonly size: number;

  readonly weight: string | null;

  readonly italics: boolean;

  readonly fixedWidth: boolean;

  readonly fontName: string;

  constructor(readonly family: string | null = null, options: FontUsageOptions = {})
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
