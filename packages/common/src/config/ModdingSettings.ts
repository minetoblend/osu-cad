import type { ConfigKey } from './ConfigManager';

export class ModdingSettings<T> implements ConfigKey<T> {
  __type__!: T;

  constructor(readonly name: string) {
  }

  static readonly ShowMinorIssues = new ModdingSettings<boolean>('ShowMinorIssues');
}
