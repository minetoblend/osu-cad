import { CommandManager } from './CommandManager';
import { EditorSocket } from './EditorSocket';
import { EditorContext } from './EditorContext';
import {
  Beatmap,
  CommandContext,
  getCommandHandler,
  IEditorCommand,
} from '@osucad/common';
import { ConnectedUsersManager } from './ConnectedUsersManager';

export class OnlineCommandManager extends CommandManager {
  constructor(
    editorContext: EditorContext,
    beatmap: Beatmap,
    userManager: ConnectedUsersManager,
    socket: EditorSocket,
  ) {
    super(editorContext, beatmap);
    this.#socket = socket;
    this.#users = userManager;

    this.#init();

    setInterval(() => this.#flush(), 50);
  }

  createContext(): CommandContext {
    return new CommandContext(this.beatmap, false);
  }

  #socket: EditorSocket;
  #users: ConnectedUsersManager;

  #init() {
    this.#socket.on('commands', (commands, sessionId) =>
      this.#onCommandsReceived(commands, sessionId),
    );
  }

  #onCommandsReceived(commands: IEditorCommand[], sessionId: number) {
    if (sessionId === this.#users.ownUser.sessionId) {
      for (const command of commands) {
        const handler = getCommandHandler(command);
        if (handler) {
          handler.acknowledge(this.context, command);
        }
      }
    } else {
      for (const command of commands) {
        const handler = getCommandHandler(command);
        if (handler) {
          handler.apply(this.context, command, 'remote');
        }
      }
    }
  }

  #commandBuffer: IEditorCommand[] = [];

  protected afterCommandSubmit(command: IEditorCommand) {
    super.afterCommandSubmit(command);

    this.#commandBuffer.push(command);
  }

  #flush() {
    if (this.#commandBuffer.length > 0) {
      this.#socket.emit('commands', this.#commandBuffer);
      this.#commandBuffer = [];
    }
  }
}
