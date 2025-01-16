import type { IBeatmap, Ruleset } from '@osucad/core';
import type { ReadonlyDependencyContainer } from '@osucad/framework';
import type { OsuHitObject } from './hitObjects/OsuHitObject';
import type { OsuPlayfield } from './ui/OsuPlayfield';
import { DrawableOsuRuleset } from './DrawableOsuRuleset';
import { EditorJudgeProvider } from './edit/EditorJudge';
import { PlayfieldGrid } from './edit/PlayfieldGrid';

export class DrawableOsuEditorRuleset extends DrawableOsuRuleset {
  constructor(ruleset: Ruleset, beatmap: IBeatmap<OsuHitObject>) {
    super(ruleset, beatmap);

    this.preventInputManager = true;
  }

  override createPlayfield(): OsuPlayfield {
    return super.createPlayfield().adjust((it) => {
      it.customJudgeProvider = new EditorJudgeProvider();
      it.showJudgements = false;
      it.hitObjectsAlwaysHit = true;
      it.suppressHitSounds = true;
      it.add(new PlayfieldGrid().with({
        depth: 1,
      }));
    });
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.beatmap.hitObjects.added.addListener(this.addHitObject, this);
    this.beatmap.hitObjects.removed.addListener(this.removeHitObject, this);
  }

  override dispose(isDisposing: boolean = true) {
    super.dispose(isDisposing);

    this.beatmap.hitObjects.added.removeListener(this.addHitObject, this);
    this.beatmap.hitObjects.removed.removeListener(this.removeHitObject, this);
  }
}
