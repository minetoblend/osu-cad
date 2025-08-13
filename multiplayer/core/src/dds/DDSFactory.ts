import type { DDS } from "./DDS.js";
import type { DDSAttributes } from "@osucad/multiplayer-protocol";

export interface DDSFactory<out T extends DDS>
{
  attributes: DDSAttributes
  create(): T
}

export type DDSConstructor<T extends DDS> = { attributes: DDSAttributes } & (new () => T);

export type DDSFactoryOrConstructor<T extends DDS> = DDSFactory<T> | DDSConstructor<T>;

export function toDDSFactory<T extends DDS>(value: DDSFactoryOrConstructor<T>): DDSFactory<T>
{
  if ("create" in value)
    return value;

  return { attributes: value.attributes, create: () => new value() };
}
