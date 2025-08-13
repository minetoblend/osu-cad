export interface ClientMessages
{
  deltas(deltas: ClientMessages.Delta[]): void
}

export namespace ClientMessages
{
  export interface Delta
  {
    readonly targetId: string
    readonly content: unknown
  }
}
