import { Axes, Container, dependencyLoader } from 'osucad-framework';
import { Playground } from '../playground/Playground.ts';
import { DropdownItem, DropdownSelect } from './DropdownSelect.ts';

export class DropdownSelectPlayground extends Playground {
  @dependencyLoader()
  load() {
    this.padding = 10;
    this.add(new Container({
      relativeSizeAxes: Axes.Y,
      width: 300,
      child: new DropdownSelect({
        items: [
          new DropdownItem('Item 1', 1),
          new DropdownItem('Item 2', 2),
          new DropdownItem('Item 3', 3),
        ],
      }),
    }));
  }
}
