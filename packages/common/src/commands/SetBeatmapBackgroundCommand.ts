import { CommandHandler } from './CommandHandler';
import { IEditorCommand } from './IEditorCommand';
import { BaseCommand } from './BaseEditorCommand';
import { CommandContext } from './CommandContext';
import { registerCommand } from './commandHandlerts';

export interface ISetBeatmapBackgroundCommand extends IEditorCommand {
  filename: string;
}

export class SetBeatmapBackgroundCommand
  extends BaseCommand
  implements ISetBeatmapBackgroundCommand
{
  version = 0;
  filename: string;

  constructor(filename: string) {
    super(SetBeatmapBackgroundHandler);

    this.filename = filename;
  }
}

export class SetBeatmapBackgroundHandler extends CommandHandler<ISetBeatmapBackgroundCommand> {
  apply(ctx: CommandContext, command: ISetBeatmapBackgroundCommand): void {
    ctx.beatmap.backgroundPath = command.filename;
  }

  get command(): string {
    return 'setBeatmapBackground';
  }

  createUndoCommand(): IEditorCommand | null {
    return null;
  }
}

registerCommand(new SetBeatmapBackgroundHandler());
