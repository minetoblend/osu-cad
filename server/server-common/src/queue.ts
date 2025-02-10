export interface IProducer<T> {
  send(messages: T[], documentId: string): Promise<void>;
}
