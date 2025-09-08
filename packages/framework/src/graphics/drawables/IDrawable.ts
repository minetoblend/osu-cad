import type { Action } from "../../bindables/Action";
import type { Drawable, LoadState } from "./Drawable";
import type { IDisposable } from "../../types/IDisposable";

export interface IDrawable extends IDisposable
{
  get removeWhenNotAlive(): boolean

  get typeName(): string

  get isLoaded(): boolean

  readonly onLoadComplete: Action<Drawable>

  expire(calculateLifetimeStart?: boolean): void

  readonly loadState: LoadState

  lifetimeStart: number
  lifetimeEnd: number
}
