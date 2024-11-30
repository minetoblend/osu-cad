export type ClientMessage =
  | never;

export interface ClientMessages {
  createChatMessage(content: string): void;
}
