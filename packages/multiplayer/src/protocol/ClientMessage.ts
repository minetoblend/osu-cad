export type ClientMessage =
  | SubmitOpsClientMessage
  | UpdatePresenceClientMessage;

export interface SubmitOpsClientMessage {
  type: 'submit_ops';
  version: number;
  ops: string[];
}

export interface UpdatePresenceClientMessage {
  type: 'update_presence';
  key: string;
  value: any;
}
