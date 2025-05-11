import type { PassThroughInputManager, ReadonlyDependencyContainer } from "@osucad/framework";
import { Axes, Container, Lazy } from "@osucad/framework";
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

    this.keybindingInputManager = this.createInputManager();
    this.#playfieldAdjustmentContainer = this.createPlayfieldAdjustmentContainer();
    this.#playfield = new Lazy(() => this.createPlayfield().adjust(p =>
    {
      // TODO
    }));
  }

  readonly #playfieldAdjustmentContainer: PlayfieldAdjustmentContainer;
  readonly #playfield: Lazy<Playfield>;

  protected override load(dependencies: ReadonlyDependencyContainer)
  {
    super.load(dependencies);

    this.internalChild = this.keybindingInputManager.with({
      child: this.#playfieldAdjustmentContainer.with({
        child: this.playfield,
      }),
    });
  }

  get playfield()
  {
    return this.#playfield.value;
  }

  protected get playfieldContainer()
  {
    return this.#playfieldAdjustmentContainer;
  }

  keybindingInputManager: PassThroughInputManager;

  protected abstract createInputManager(): PassThroughInputManager;

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
