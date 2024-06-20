import { Drawable } from '../../drawable/Drawable';

export abstract class UIEvent {
  constructor(readonly handler: keyof Drawable) {}
}
