import type { ReadonlyDependencyContainer } from 'osucad-framework';
import { resolved } from 'osucad-framework';
import { IBeatmap } from '../../../beatmap/IBeatmap';
import { Ruleset } from '../../../rulesets/Ruleset';
import { EditorBeatmap } from '../../EditorBeatmap';
import { EditorScreen } from '../EditorScreen';
import { editorScreen } from '../metadata';
import { ModdingComposer } from './ModdingComposer';

@editorScreen({
  id: 'modding',
  name: 'Modding',
})
export class ModdingScreen extends EditorScreen {
  @resolved(Ruleset)
  ruleset!: Ruleset;

  @resolved(IBeatmap)
  beatmap!: IBeatmap;

  @resolved(EditorBeatmap)
  editorBeatmap!: EditorBeatmap;

  protected override get applySafeAreaPadding(): boolean {
    return false;
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.addInternal(new ModdingComposer());
  }
}
