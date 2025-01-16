import type { Drawable } from '../graphics';
import { List } from '../utils';

export const globalTransformQueue = new List<Drawable>(100);
