import type { NoArgsConstructor } from '@osucad/common';
import {
  Bindable,
  Invalidation,
  LayoutMember,
  dependencyLoader,
} from 'osucad-framework';
import { PlayfieldContainer } from '../../playfield/PlayfieldContainer';
import { EditorScreen } from '../EditorScreen';
import { Editor } from '../../Editor';
import { ComposeTogglesBar } from './ComposeTogglesBar';
import { ComposeToolBar } from './ComposeToolBar';
import { HitObjectComposer } from './HitObjectComposer';
import type { DrawableComposeTool } from './tools/DrawableComposeTool';
import type { ComposeTool } from './tools/ComposeTool';
import { SelectTool } from './tools/SelectTool';

export type ToolConstructor = NoArgsConstructor<DrawableComposeTool>;

export class ComposeScreen extends EditorScreen {
  constructor() {
    super();
    this.addLayout(this.#paddingBacking);
  }

  #paddingBacking = new LayoutMember(Invalidation.DrawSize);

  #playfieldContainer!: PlayfieldContainer;
  #toolBar!: ComposeToolBar;
  #togglesBar!: ComposeTogglesBar;

  #composer!: HitObjectComposer;

  #activeTool = new Bindable<ComposeTool>(new SelectTool());

  @dependencyLoader()
  init() {
    this.add((this.#playfieldContainer = new PlayfieldContainer()));
    this.add((this.#toolBar = new ComposeToolBar(this.#activeTool)));
    this.add((this.#togglesBar = new ComposeTogglesBar()));
    this.#playfieldContainer.add(
      (this.#composer = new HitObjectComposer(this.#activeTool)),
    );
  }

  protected loadComplete() {
    super.loadComplete();

    this.findClosestParentOfType(Editor)?.requestSelectTool.addListener(() =>
      this.#activeTool.value = new SelectTool(),
    );
  }

  update(): void {
    super.update();

    if (!this.#paddingBacking.isValid) {
      this.#playfieldContainer.padding = {
        horizontal: this.#toolBar.layoutSize.x,
        top: this.drawSize.x < 1250 ? 15 : 0,
        bottom: this.drawSize.x < 1110 ? 15 : 0,
      };
      this.#paddingBacking.validate();
    }
  }

  show() {
    super.show();

    this.#toolBar.x = -100;
    this.#toolBar.moveTo({ x: 0, duration: 750, easing: 'expo.out' });

    this.#togglesBar.x = 100;
    this.#togglesBar.moveTo({ x: 0, duration: 750, easing: 'expo.out' });

    this.#playfieldContainer.y = 100;
    this.#playfieldContainer.moveTo({ y: 0, duration: 750, easing: 'expo.out' });
  }

  hide() {
    super.hide();

    this.#toolBar.moveTo({ x: -100, duration: 500, easing: 'expo.out' });
    this.#togglesBar.moveTo({ x: 100, duration: 500, easing: 'expo.out' });

    this.#playfieldContainer.moveTo({ y: 100, duration: 500, easing: 'expo.out' });
  }
}
