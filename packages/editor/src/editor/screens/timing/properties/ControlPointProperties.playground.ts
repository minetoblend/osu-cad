import { Axes, Container, dependencyLoader } from 'osucad-framework';
import { Playground } from '../../../../playground/Playground.ts';
import { ControlPointProperties } from './ControlPointProperties.ts';

export class ControlPointPropertiesPlayground extends Playground {
  @dependencyLoader()
  load() {
    this.padding = 20;

    this.add(new Container({
      relativeSizeAxes: Axes.Y,
      width: 400,
      child: new ControlPointProperties(),
    }));
  }
}
