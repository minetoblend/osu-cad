import type { MutationSource } from './MutationSource';

export interface MutationContext {
  source: MutationSource;
  own: boolean;
  version: number;
}
