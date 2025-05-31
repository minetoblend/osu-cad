import type { PassThroughInputManager, ReadonlyDependencyContainer } from "@osucad/framework";
import { Action, Axes, Container, Lazy } from "@osucad/framework";
import type { HitObject } from "../hitObjects/HitObject";
import type { Playfield } from "./Playfield";
import type { PlayfieldAdjustmentContainer } from "./PlayfieldAdjustmentContainer";
import type { GameplayProcessor } from "./GameplayProcessor";
import type { JudgementResult } from "../judgements/JudgementResult";

export abstract class DrawableRuleset extends Container
{
  readonly newResult = new Action<JudgementResult>();
  readonly revertResult = new Action<JudgementResult>();

  protected constructor()
  {
    super({
      relativeSizeAxes: Axes.Both,
    });

    this.keybindingInputManager = this.createInputManager();
    this.#playfieldAdjustmentContainer = this.createPlayfieldAdjustmentContainer();
    this.#playfield = new Lazy(() => this.createPlayfield().adjust(p =>
    {
      p.newResult.addListener((_, r) => this.newResult.emit(r));
      p.revertResult.addListener(r => this.revertResult.emit(r));
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

  abstract createPlayfieldAdjustmentContainer(): PlayfieldAdjustmentContainer;

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
