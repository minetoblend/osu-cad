import type { MutationSource } from './MutationSource';

export interface MutationContext {
  source: MutationSource;
  version: number;
}
