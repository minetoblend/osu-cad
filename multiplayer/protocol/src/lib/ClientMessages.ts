export interface ClientMessages
{
  deltas(deltas: ClientMessages.Delta[]): void
  signal(target: string, type: string, signal: unknown): void
}

export namespace ClientMessages
{
  export interface Delta
  {
    readonly targetId: string
    readonly content: unknown
  }
}
