import { Container, resolved } from 'osucad-framework';
import { CommandManager } from './context/CommandManager';
import { IEditorCommand } from '@osucad/common';

export class CommandContainer extends Container {
  @resolved(CommandManager)
  protected readonly commandManager!: CommandManager;

  protected submit(command: IEditorCommand, commit = true) {
    this.commandManager.submit(command, commit);
  }

  protected commit() {
    this.commandManager.commit();
  }
}
