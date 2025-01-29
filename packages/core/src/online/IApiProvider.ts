import type { APIUser } from '@osucad/core';
import type { ReadonlyBindable } from '@osucad/framework';
import type { APIState } from './APIState';

export interface IApiProvider {
  get state(): ReadonlyBindable<APIState>;

  get localUser(): ReadonlyBindable<APIUser>;

  login(): void;
}
