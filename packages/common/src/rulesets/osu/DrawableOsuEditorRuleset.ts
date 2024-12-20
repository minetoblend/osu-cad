import type { IBeatmap } from '../../beatmap/IBeatmap';
import type { Ruleset } from '../Ruleset';
import type { OsuPlayfield } from './ui/OsuPlayfield';
import { EditorJudgeProvider } from '../../editor/EditorJudge';
import { DrawableOsuRuleset } from './DrawableOsuRuleset';

export class DrawableOsuEditorRuleset extends DrawableOsuRuleset {
  constructor(ruleset: Ruleset, beatmap: IBeatmap) {
    super(ruleset, beatmap);
  }

  override createPlayfield(): OsuPlayfield {
    return super.createPlayfield().adjust((it) => {
      it.customJudgeProvider = new EditorJudgeProvider();
      it.showJudgements = false;
      it.hitObjectsAlwaysHit = true;
    });
  }
}
