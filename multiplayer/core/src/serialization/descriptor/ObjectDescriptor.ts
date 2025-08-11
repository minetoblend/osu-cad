import type { SerialDescriptor } from "./SerialDescriptor.js";
import { SerialKind } from "./SerialKind.js";

export class ObjectDescriptor implements SerialDescriptor
{
  constructor(
    readonly elements: {
      readonly name: string,
      descriptor: SerialDescriptor
    } [],
  )
  {
    const name2Index = this.#name2Index =  new Map<string, number>;

    for (let i = 0; i < elements.length; i++)
      name2Index.set(elements[i].name, i);
  }

  readonly #name2Index: Map<string, number>;

  readonly kind = SerialKind.Object;

  get elementCount()
  {
    return this.elements.length;
  }

  public getElementName(index: number): string
  {
    return this.elements[index].name;
  }

  public getElementIndex(name: string): number
  {
    return this.#name2Index.get(name) ?? -1;
  }

  public getElementDescriptor(index: number): SerialDescriptor
  {
    return this.elements[index].descriptor;
  }
}
