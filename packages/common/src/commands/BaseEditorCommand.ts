import { Constructor } from '../util';
import { CommandHandler } from './CommandHandler';
import type { IEditorCommand } from './IEditorCommand';

export class BaseCommand implements IEditorCommand {
  version = 0;
  type: string;

  constructor(handler: Constructor<CommandHandler<any>>) {
    this.type = handler.prototype.command;
  }
}
