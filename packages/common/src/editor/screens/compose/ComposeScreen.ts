import { dependencyLoader, resolved } from 'osucad-framework';
import { Ruleset } from '../../../rulesets/Ruleset';
import { EditorScreen } from '../EditorScreen';
import { editorScreen } from '../metadata';

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

  @dependencyLoader()
  [Symbol('load')]() {
    this.addInternal(
      this.ruleset.createHitObjectComposer(),
    );
  }
}
