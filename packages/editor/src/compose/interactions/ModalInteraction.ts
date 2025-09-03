import { Interaction } from "./Interaction";

export abstract class ModalInteraction<TResult> extends Interaction
{
  public abstract result: TResult | undefined;

  protected getResult(): TResult | undefined
  {
    return undefined;
  }

  protected override onComplete(): void
  {
    this.result ??= this.getResult();
  }

  protected override onCancel(): void
  {
    this.result = undefined;
  }
}
