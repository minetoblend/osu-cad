import type { Drawable } from '../drawables/Drawable';

export type GridContainerContent = readonly (readonly (Drawable | undefined)[])[];
