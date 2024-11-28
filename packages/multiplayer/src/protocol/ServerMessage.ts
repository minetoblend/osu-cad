export type ServerMessage =
  | InitialStateServerMessage;

export interface ServerMessages {
  initialData(message: InitialStateServerMessage): void;
}

export interface InitialStateServerMessage {
  clientId: number;
  beatmapData: unknown;
  assets: AssetInfo[];
}

export interface AssetInfo {
  path: string;
  id: string;
  filesize: number;
}
