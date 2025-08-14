import type { DDSAttributes } from "@osucad/multiplayer-protocol";
import { NoopDDS } from "./NoopDDS.js";

export class Signaler<Signals extends { [key: string]:  (...args: any[]) => void } = { [key: string]: (...args: any[]) => void }> extends NoopDDS<Signals>
{
  static readonly attributes: DDSAttributes = {
    type: "@osucad/signaler",
    version: 0,
  };

  constructor()
  {
    super(Signaler.attributes);
  }

  send<T extends keyof Signals>(type: T, ...args: Parameters<Signals[T]>)
  {
    this.submitSignal(type as string, args);
  }

  protected override processSignal(type: string, signal: unknown, clientId: number): void
  {
    this.emit(type as any, ...(signal as any));
  }
}
