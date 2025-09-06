export interface IProducer<T>
{
  send(...messages: T[]): Promise<void>
}
