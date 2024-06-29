import { Invalidation, LayoutMember, dependencyLoader } from 'osucad-framework';
import { EditorScreen } from '../EditorScreen';
import { PlayfieldContainer } from '../../playfield/PlayfieldContainer';

export class ComposeScreen extends EditorScreen {
  constructor() {
    super();
    this.addLayout(this.#paddingBacking);
  }

  #paddingBacking = new LayoutMember(Invalidation.DrawSize);

  @dependencyLoader()
  init() {
    this.add(new PlayfieldContainer());
  }

  update(): void {
    super.update();

    if (!this.#paddingBacking.isValid) {
      this.padding = {
        top: this.drawSize.x < 1740 ? 15 : 0,
        bottom: this.drawSize.x < 1640 ? 15 : 0,
      };
      this.#paddingBacking.validate();
    }
  }
}
