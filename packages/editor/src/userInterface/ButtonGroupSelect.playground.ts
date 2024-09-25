import { Playground } from '../playground/Playground';
import { dependencyLoader } from 'osucad-framework';
import { ButtonGroupSelect } from './ButtonGroupSelect';

export class ButtonGroupSelectPlayground extends Playground {
  @dependencyLoader()
  load() {
    this.padding = 10;

    this.addAllInternal(
      new ButtonGroupSelect({
        width: 200,
        height: 40,
        items: [
          {
            label: 'Foo',
            value: 'foo',
          },
          {
            label: 'Bar',
            value: 'bar',
          },
        ],
      }),
    );
  }
}
