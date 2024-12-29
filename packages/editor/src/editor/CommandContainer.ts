import type { EditorCommand } from '@osucad/common';
import { Container, resolved } from 'osucad-framework';
import { CommandManager } from './context/CommandManager';

export class CommandContainer extends Container {
  @resolved(CommandManager)
  protected readonly commandManager!: CommandManager;

  protected submit(
    command: EditorCommand,
    commit = false,
  ) {
    return this.commandManager.submit(command, commit);
  }

  protected commit() {
    this.commandManager.commit();
  }
}
