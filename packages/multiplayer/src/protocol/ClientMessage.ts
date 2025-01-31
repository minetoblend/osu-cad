export type ClientMessage =
    | SubmitOpsClientMessage;

export interface SubmitOpsClientMessage {
  type: 'submit_ops';
  version: number;
  ops: string[];
}
