import { injectionToken } from '@osucad/framework';

export interface IEndpointConfiguration {
  readonly apiV1Endpoint: string;
}

// eslint-disable-next-line ts/no-redeclare
export const IEndpointConfiguration = injectionToken<IEndpointConfiguration>();
