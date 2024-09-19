import { Axes, dependencyLoader } from 'osucad-framework';
import { Playground } from '../playground/Playground.ts';
import { Toggle } from './Toggle.ts';

export class TogglePlayground extends Playground {
  @dependencyLoader()
  load() {
    this.relativePositionAxes = Axes.Both;

    this.padding = 20;
    this.add(new Toggle());
  }
}
