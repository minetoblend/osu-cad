import { Container, resolved } from 'osucad-framework';
import type { CommandHandler, IEditorCommand } from '@osucad/common';
import { CommandManager } from './context/CommandManager';

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
