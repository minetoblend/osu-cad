import type { PoolableDrawable } from './PoolableDrawable';

export interface IDrawablePool {
  get: (setupAction?: (d: PoolableDrawable) => void) => PoolableDrawable;

  return: (drawable: PoolableDrawable) => void;
}
