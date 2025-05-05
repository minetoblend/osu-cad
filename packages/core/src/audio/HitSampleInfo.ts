import type { ISampleInfo } from "./ISampleInfo";

export class HitSampleInfo implements ISampleInfo
{
  public static readonly HIT_NORMAL = "hitnormal";
  public static readonly HIT_WHISTLE = "hitwhistle";
  public static readonly HIT_FINISH = "hitfinish";
  public static readonly HIT_CLAP = "hitclap";

  public static readonly BANK_NORMAL = "normal";
  public static readonly BANK_SOFT = "soft";
  public static readonly BANK_DRUM = "drum";

  public static readonly ALL_ADDITIONS = [this.HIT_WHISTLE, this.HIT_FINISH, this.HIT_CLAP];
  public static readonly ALL_BANKS = [this.BANK_NORMAL, this.BANK_SOFT, this.BANK_DRUM];

  constructor(
    readonly name: string,
    readonly bank = HitSampleInfo.BANK_NORMAL,
    readonly suffix?: string,
    readonly volume = 100,
    readonly editorAutoBank = true,
  )
  {
  }

  get lookupNames(): string[]
  {
    const { suffix, bank, name } = this;

    if (suffix && suffix.length > 0)
      return [`${bank}-${name}${suffix}`];

    return [
      `${bank}-${name}`,
      name,
    ];
  }

  public equals(other: ISampleInfo): boolean
  {
    if (!(other instanceof HitSampleInfo))
      return false;

    return this.suffix === other.suffix
        && this.bank === other.bank
        && this.name === other.name
        && this.volume === other.volume
        && this.editorAutoBank === other.editorAutoBank;
  }
}
