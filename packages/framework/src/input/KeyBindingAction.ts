export abstract class KeyBindingAction
{
  public toString()
  {
    return JSON.stringify(this);
  }

  public equals(other: KeyBindingAction)
  {
    return this === other;
  }
}
