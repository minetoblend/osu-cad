import type { CommandHandler } from './CommandHandler';

const HandlerKey = Symbol('HandlerKey');

export interface IEditorCommand<
  THandler extends CommandHandler<any> = CommandHandler<any>,
> {
  version: number;
  type: string;
  [HandlerKey]?: THandler;
}
