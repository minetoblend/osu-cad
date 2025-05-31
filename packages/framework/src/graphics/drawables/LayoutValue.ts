import { LayoutMember } from "./LayoutMember";

export class LayoutValue<T> extends LayoutMember
{
  #value?: T;

  get value(): T
  {
    if (!this.isValid)
      throw new Error("May not query value of an invalid LayoutValue.");

    return this.#value!;
  }

  set value(value: T)
  {
    this.#value = value;
    this.validate();
  }
}
