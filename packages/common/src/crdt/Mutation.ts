import type { ObjectHandle } from './ObjectHandle';

export interface Mutation<T> {
  handle: ObjectHandle;
  payload: T;
}
