import type { ReadonlyDependencyContainer } from "@osucad/framework";
import { Axes, Container } from "@osucad/framework";
import type { HitObject } from "../hitObjects/HitObject";
import type { Playfield } from "./Playfield";
import type { PlayfieldAdjustmentContainer } from "./PlayfieldAdjustmentContainer";
import type { GameplayProcessor } from "./GameplayProcessor";

export abstract class DrawableRuleset extends Container
{
  protected constructor()
  {
    super({
      relativeSizeAxes: Axes.Both,
    });
  }

  protected override load(dependencies: ReadonlyDependencyContainer)
  {
    super.load(dependencies);

    this.addInternal(
        this.playfieldContainer = this.createPlayfieldAdjustmentContainer()
          .with({
            children: [
              this.playfield = this.createPlayfield(),
            ],
          }),
    );

    this.gameplayProcessor = this.createGameplayProcessor(this.playfield);
    if (this.gameplayProcessor)
      this.playfieldContainer.add(this.gameplayProcessor.with({ depth: Number.MAX_VALUE }));
  }

  playfield!: Playfield;

  playfieldContainer!: PlayfieldAdjustmentContainer;

  protected gameplayProcessor: GameplayProcessor | null = null;

  protected createGameplayProcessor(playfield: Playfield): GameplayProcessor | null
  {
    return null;
  }

  protected abstract createPlayfieldAdjustmentContainer(): PlayfieldAdjustmentContainer;

  protected abstract createPlayfield(): Playfield;

  addHitObject(hitObject: HitObject)
  {
    this.playfield.addHitObject(hitObject);
  }

  removeHitObject(hitObject: HitObject)
  {
    this.playfield.removeHitObject(hitObject);
  }
}
