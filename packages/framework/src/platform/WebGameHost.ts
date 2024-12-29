import { Vec2 } from '../math';
import { GameHost, type GameHostOptions } from './GameHost';

export class WebGameHost extends GameHost {
  override getWindowSize(): Vec2 {
    if (this.container === document.body) {
      return new Vec2(window.innerWidth, window.innerHeight);
    }
    else {
      return new Vec2(this.container.clientWidth, this.container.clientHeight);
    }
  }

  constructor(gameName: string, options: GameHostOptions = {}) {
    super(gameName, options);
  }
}
