import type { DDSAttributes, IRemoteSignalMessage } from "@osucad/multiplayer-protocol";
import { NoopDDS } from "./NoopDDS.js";

export class Signaler<Signals extends { [key: string]: (content: any, clientId: string) => void } = { [key: string]: (content: unknown, clientId: string) => void }> extends NoopDDS<Signals>
{
  public static readonly attributes: DDSAttributes = {
    type: "@osucad/signaler",
    version: 0,
  };

  public constructor()
  {
    super(Signaler.attributes);
  }

  public send<T extends keyof Signals>(type: T, content: Parameters<Signals[T]>[0])
  {
    this.submitSignal(type as string, content);
  }

  protected override processSignal(message: IRemoteSignalMessage, local: boolean): void
  {
    if (local)
      return;

    (this as any).emit(message.type, message.content, message.clientId);
  }
}
