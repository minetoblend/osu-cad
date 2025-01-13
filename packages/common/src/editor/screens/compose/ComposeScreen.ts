import type { Drawable, ReadonlyDependencyContainer } from 'osucad-framework';
import type { EditorSafeArea } from '../../EditorSafeArea';
import type { EditorCornerContent } from '../../ui/EditorCornerContent';
import type { HitObjectComposer } from './HitObjectComposer';
import { resolved } from 'osucad-framework';
import { Ruleset } from '../../../rulesets/Ruleset';
import { EditorScreen } from '../EditorScreen';
import { editorScreen } from '../metadata';
import { ComposeScreenTimelineControls } from './ComposeScreenTimelineControls';

@editorScreen({
  id: 'compose',
  name: 'Compose',
})
export class ComposeScreen extends EditorScreen {
  constructor() {
    super();
  }

  @resolved(Ruleset)
  ruleset!: Ruleset;

  #composer!: HitObjectComposer;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.addInternal(this.#composer = this.ruleset.createHitObjectComposer());
  }

  protected override applySafeAreaPadding(safeArea: EditorSafeArea) {
    this.#composer.applySafeAreaPadding(safeArea);
  }

  override createTopBarContent(): Drawable {
    return this.#composer.topBar;
  }

  override createTopRightCornerContent(): EditorCornerContent {
    return new ComposeScreenTimelineControls();
  }
}
