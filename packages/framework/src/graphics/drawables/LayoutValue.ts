import { LayoutMember } from "./LayoutMember";

export class LayoutValue<T> extends LayoutMember
{
  #value?: T;

  public get value(): T
  {
    if (!this.isValid)
      throw new Error("May not query value of an invalid LayoutValue.");

    return this.#value!;
  }

  public set value(value: T)
  {
    this.#value = value;
    this.validate();
  }
}
