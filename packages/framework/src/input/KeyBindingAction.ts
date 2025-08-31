export abstract class KeyBindingAction
{
  public toString()
  {
    return JSON.stringify(this);
  }

  public equals(other: KeyBindingAction | (new (...args: any) => KeyBindingAction))
  {
    return this === other || (typeof other === "function" && this instanceof other);
  }
}
