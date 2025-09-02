import { BindableBoolean, type KeyCombination } from "@osucad/framework";

export interface KeyReceiver
{
  readonly keyCombination: KeyCombination

  onPressed(): boolean

  onReleased(): void
}

export class KeyCombinationToggle extends BindableBoolean implements KeyReceiver
{
  public constructor(public readonly keyCombination: KeyCombination)
  {
    super(false);
  }

  public onPressed(): boolean
  {
    this.toggle();

    return true;
  }

  public onReleased(): void
  {
    this.toggle();
  }
}
