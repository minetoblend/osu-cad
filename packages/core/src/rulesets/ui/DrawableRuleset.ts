import { Axes, Container, ReadonlyDependencyContainer } from "@osucad/framework";
import { HitObject } from "../hitObjects/HitObject";
import { Playfield } from "./Playfield";
import { PlayfieldAdjustmentContainer } from "./PlayfieldAdjustmentContainer";

export abstract class DrawableRuleset extends Container {
  protected constructor() {
    super({
      relativeSizeAxes: Axes.Both,
    });
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.addInternal(
        this.createPlayfieldAdjustmentContainer().with({
          children: [
            this.playfield = this.createPlayfield()
          ]
        })
    )
  }

  playfield!: Playfield;

  protected abstract createPlayfieldAdjustmentContainer(): PlayfieldAdjustmentContainer;

  protected abstract createPlayfield(): Playfield;

  addHitObject(hitObject: HitObject) {
    this.playfield.addHitObject(hitObject)
  }

  removeHitObject(hitObject: HitObject) {
    this.playfield.removeHitObject(hitObject)
  }
}