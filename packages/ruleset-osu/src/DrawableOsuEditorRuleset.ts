import type { IBeatmap, Ruleset } from '@osucad/core';
import type { ReadonlyDependencyContainer } from '@osucad/framework';
import type { OsuHitObject } from './hitObjects/OsuHitObject';
import type { OsuPlayfield } from './ui/OsuPlayfield';
import { resolved } from '@osucad/framework';
import { DrawableOsuRuleset } from './DrawableOsuRuleset';
import { HitSoundPlayer } from './edit/HitSoundPlayer';
import { PlayfieldGrid } from './edit/PlayfieldGrid';

export class DrawableOsuEditorRuleset extends DrawableOsuRuleset {
  constructor(ruleset: Ruleset, beatmap: IBeatmap<OsuHitObject>) {
    super(ruleset, beatmap);

    this.preventInputManager = true;
  }

  override createPlayfield(): OsuPlayfield {
    return super.createPlayfield().adjust((it) => {
      it.showJudgements = false;
      it.hitObjectsAlwaysHit = true;
      it.suppressHitSounds = true;
      it.add(new PlayfieldGrid().with({
        depth: 1,
      }));
    });
  }

  @resolved(HitSoundPlayer, true)
  hitSoundPlayer?: HitSoundPlayer;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    if (!this.hitSoundPlayer)
      this.addInternal(this.hitSoundPlayer = new HitSoundPlayer());

    this.beatmap.hitObjects.added.addListener(this.addHitObject, this);
    this.beatmap.hitObjects.removed.addListener(this.removeHitObject, this);
  }

  override dispose(isDisposing: boolean = true) {
    super.dispose(isDisposing);

    this.beatmap.hitObjects.added.removeListener(this.addHitObject, this);
    this.beatmap.hitObjects.removed.removeListener(this.removeHitObject, this);
  }

  override get propagatePositionalInputSubTree(): boolean {
    return false;
  }

  override get propagateNonPositionalInputSubTree(): boolean {
    return false;
  }
}
