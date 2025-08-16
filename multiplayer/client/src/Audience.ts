import type { IClient } from "@osucad/multiplayer-protocol";
import { EventEmitter } from "eventemitter3";

export interface IAudienceEvents
{
  addMember(member: IClient): void

  removeMember(member: IClient): void

  selfChanged(self: ISelf): void
}

export interface IAudience extends EventEmitter<IAudienceEvents>
{
  getMembers(): ReadonlyMap<string, IClient>

  getMember(id: string): IClient | undefined

  getSelf(): ISelf | undefined
}

export interface ISelf
{
  clientId: string,
  details: IClient | undefined
}

export class Audience extends EventEmitter<IAudienceEvents> implements IAudience
{
  readonly #members = new Map<string, IClient>();
  #ownClientId: string | undefined = undefined;

  getMembers(): ReadonlyMap<string, IClient>
  {
    return this.#members;
  }

  getMember(id: string)
  {
    return this.#members.get(id);
  }

  setOwnClientId(clientId: string)
  {
    if (this.#ownClientId !== clientId)
    {
      this.#ownClientId = clientId;
      this.emit("selfChanged", { clientId, details: this.getMember(clientId) });
    }
  }

  addMember(client: IClient)
  {
    if (!this.#members.has(client.clientId))
    {
      this.#members.set(client.clientId, client);
      this.emit("addMember", client);
    }
  }

  removeMember(clientId: string)
  {
    const client = this.#members.get(clientId);

    if (!client)
      return false;

    this.#members.delete(clientId);
    this.emit("removeMember", client);

    return true;
  }

  getSelf(): ISelf | undefined
  {
    if (!this.#ownClientId)
      return undefined;

    return {
      clientId: this.#ownClientId,
      details: this.getMember(this.#ownClientId),
    };
  }
}
