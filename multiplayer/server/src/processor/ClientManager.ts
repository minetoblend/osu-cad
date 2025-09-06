export class ClientManager
{
  private readonly clients = new Map<string, ClientManager.Client>;

  public upsertClient(
    clientId: string,
  ): boolean
  {
    const client = this.clients.get(clientId);

    if (client)
    {
      // TODO
      return false;
    }

    this.clients.set(clientId, {
      clientId,
    });

    return true;
  }

  public getClient(clientId: string): ClientManager.Client | undefined
  {
    return this.clients.get(clientId);
  }

  public removeClient(clientId: string): boolean
  {
    return this.clients.delete(clientId);
  }

  public createSnapshot(): ClientManager.Client[]
  {
    return structuredClone([...this.clients.values()]);
  }
}

export namespace ClientManager
{
  export interface Client
  {
    readonly clientId: string
  }
}
