import { List } from '../utils';
import type { Drawable } from '../graphics';

export const globalTransformQueue = new List<Drawable>(100);
