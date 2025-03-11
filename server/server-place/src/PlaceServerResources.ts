import type { IResources } from '@osucad-server/common';
import type { Provider } from 'nconf';

export class PlaceServerResources implements IResources {
  constructor(
    readonly config: Provider,
  ) {}

  async dispose() {}
}
