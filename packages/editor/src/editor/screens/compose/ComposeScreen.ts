import {
  Axes,
  Invalidation,
  LayoutMember,
  dependencyLoader,
} from 'osucad-framework';
import { EditorScreen } from '../EditorScreen';
import { PlayfieldContainer } from '../../playfield/PlayfieldContainer';
import { ComposeToolbar } from './ComposeToolbar';
import { ComposeToolbarButton } from './ComposeToolbarButton';

export class ComposeScreen extends EditorScreen {
  constructor() {
    super();
    this.addLayout(this.#paddingBacking);
  }

  #paddingBacking = new LayoutMember(Invalidation.DrawSize);

  #playfieldContainer!: PlayfieldContainer;
  #leftToolbar!: ComposeToolbar;

  @dependencyLoader()
  init() {
    this.add((this.#playfieldContainer = new PlayfieldContainer()));
    this.add((this.#leftToolbar = new ComposeToolbar()));
  }

  update(): void {
    super.update();

    if (!this.#paddingBacking.isValid) {
      this.#playfieldContainer.padding = {
        horizontal: this.#leftToolbar.layoutSize.x,
        top: this.drawSize.x < 1740 ? 15 : 0,
        bottom: this.drawSize.x < 1640 ? 15 : 0,
      };
      this.#paddingBacking.validate();
    }
  }
}
