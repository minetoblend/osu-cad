import type { ISampleInfo } from '../skinning/ISampleInfo';

export class HitSampleInfo implements ISampleInfo {
  static readonly HIT_NORMAL = 'hitnormal';
  static readonly HIT_WHISTLE = 'hitwhistle';
  static readonly HIT_FINISH = 'hitfinish';
  static readonly HIT_CLAP = 'hitclap';

  static readonly BANK_NORMAL = 'normal';
  static readonly BANK_SOFT = 'soft';
  static readonly BANK_DRUM = 'drum';

  static allAdditions = [
    HitSampleInfo.HIT_NORMAL,
    HitSampleInfo.HIT_WHISTLE,
    HitSampleInfo.HIT_FINISH,
    HitSampleInfo.HIT_CLAP,
  ];

  static allBanks = [
    HitSampleInfo.BANK_NORMAL,
    HitSampleInfo.BANK_SOFT,
    HitSampleInfo.BANK_DRUM,
  ];

  constructor(
    readonly name: string,
    readonly bank: string,
    readonly suffix?: string,
    readonly volume: number = 100,
  ) {
  }

  get lookupNames(): string[] {
    const names: string[] = [];
    if (this.suffix)
      names.push(`${this.bank}-${this.name}${this.suffix}`);
    names.push(`${this.bank}-${this.name}`);
    names.push(`${this.name}`);

    return names;
  }
}
