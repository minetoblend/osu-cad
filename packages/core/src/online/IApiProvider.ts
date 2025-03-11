import type { ReadonlyBindable } from '@osucad/framework';
import type { APIState } from './APIState';
import type { APIUser } from './APIUser';

export interface IApiProvider {
  get state(): ReadonlyBindable<APIState>;

  get localUser(): ReadonlyBindable<APIUser>;

  login(): void;
}
