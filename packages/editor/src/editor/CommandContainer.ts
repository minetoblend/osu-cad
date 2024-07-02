import { Container, resolved } from 'osucad-framework';
import { CommandManager } from './context/CommandManager';
import { CommandHandler, IEditorCommand } from '@osucad/common';

export class CommandContainer extends Container {
  @resolved(CommandManager)
  protected readonly commandManager!: CommandManager;

  protected submit<T>(
    command: IEditorCommand<CommandHandler<any, T>>,
    commit = true,
  ): T | undefined {
    return this.commandManager.submit(command, commit);
  }

  protected commit() {
    this.commandManager.commit();
  }
}
