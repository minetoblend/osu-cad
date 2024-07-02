import { NoArgsConstructor } from '@osucad/common';
import {
  Bindable,
  Invalidation,
  LayoutMember,
  dependencyLoader,
} from 'osucad-framework';
import { PlayfieldContainer } from '../../playfield/PlayfieldContainer';
import { EditorScreen } from '../EditorScreen';
import { ComposeToolbar } from './ComposeToolbar';
import { HitObjectComposer } from './HitObjectComposer';
import { ComposeTool } from './tools/ComposeTool';
import { SelectTool } from './tools/SelectTool';

export type ToolConstructor = NoArgsConstructor<ComposeTool>;

export class ComposeScreen extends EditorScreen {
  constructor() {
    super();
    this.addLayout(this.#paddingBacking);
  }

  #paddingBacking = new LayoutMember(Invalidation.DrawSize);

  #playfieldContainer!: PlayfieldContainer;
  #leftToolbar!: ComposeToolbar;
  #composer!: HitObjectComposer;

  #activeTool = new Bindable<ToolConstructor>(SelectTool);

  @dependencyLoader()
  init() {
    this.add((this.#playfieldContainer = new PlayfieldContainer()));
    this.add((this.#leftToolbar = new ComposeToolbar(this.#activeTool)));
    this.add((this.#composer = new HitObjectComposer(this.#activeTool)));
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
