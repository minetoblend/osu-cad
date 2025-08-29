import type { PassThroughInputManager, ReadonlyDependencyContainer } from "@osucad/framework";
import { Action, Axes, Container, Lazy } from "@osucad/framework";
import type { HitObject } from "../hitObjects/HitObject";
import type { Playfield, PlayfieldOptions } from "./Playfield";
import type { PlayfieldAdjustmentContainer } from "./PlayfieldAdjustmentContainer";
import type { GameplayProcessor } from "./GameplayProcessor";
import type { JudgementResult } from "../judgements/JudgementResult";

export interface DrawableRulesetOptions
{
  cursor?: boolean
  useInput?: boolean
  autoMode?: boolean
}

export abstract class DrawableRuleset extends Container
{
  public readonly newResult = new Action<JudgementResult>();
  public readonly revertResult = new Action<JudgementResult>();

  protected constructor(options: DrawableRulesetOptions = {})
  {
    super({
      relativeSizeAxes: Axes.Both,
    });

    this.keybindingInputManager = this.createInputManager();
    this.keybindingInputManager.useParentInput = options.useInput ?? true;

    this.#playfieldAdjustmentContainer = this.createPlayfieldAdjustmentContainer();
    this.#playfield = new Lazy(() => this.createPlayfield({ cursor: options.cursor, autoMode: options.autoMode }).adjust(p =>
    {
      p.newResult.addListener((_, r) => this.newResult.emit(r));
      p.revertResult.addListener(r => this.revertResult.emit(r));
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

  public get playfield()
  {
    return this.#playfield.value;
  }

  protected get playfieldContainer()
  {
    return this.#playfieldAdjustmentContainer;
  }

  public keybindingInputManager: PassThroughInputManager;

  protected abstract createInputManager(): PassThroughInputManager;

  protected createGameplayProcessor(playfield: Playfield): GameplayProcessor | null
  {
    return null;
  }

  public abstract createPlayfieldAdjustmentContainer(): PlayfieldAdjustmentContainer;

  protected abstract createPlayfield(options: PlayfieldOptions): Playfield;

  public addHitObject(hitObject: HitObject)
  {
    this.playfield.addHitObject(hitObject);
  }

  public removeHitObject(hitObject: HitObject)
  {
    this.playfield.removeHitObject(hitObject);
  }
}
