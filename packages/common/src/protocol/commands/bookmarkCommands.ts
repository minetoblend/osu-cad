import { CommandContext, CommandHandler } from '../command';
import { EditorCommand } from './index';
import { EditorBookmark } from '../../osu/bookmark';

export interface CreateBookmarkCommand {
  time: number;
  name: string | null;
}

export interface RemoveBookmarkCommand {
  time: number;
}

export class CreateBookmarkHandler
  implements CommandHandler<CreateBookmarkCommand>
{
  apply(command: CreateBookmarkCommand, context: CommandContext): void {
    console.log('createBookmark', command, context.beatmap.bookmarks);
    if (context.beatmap.bookmarks.some((it) => it.time === command.time)) {
      return;
    }
    context.beatmap.bookmarks.push(
      new EditorBookmark({
        time: command.time,
        name: command.name,
      }),
    );
    context.beatmap.bookmarks.sort((a, b) => a.time - b.time);
    context.beatmap.onBookmarksChanged.emit();
  }

  createUndo(command: CreateBookmarkCommand): EditorCommand | undefined {
    return EditorCommand.removeBookmark({
      time: command.time,
    });
  }
}

export class RemoveBookmarkHandler
  implements CommandHandler<RemoveBookmarkCommand>
{
  apply(command: RemoveBookmarkCommand, context: CommandContext): void {
    const index = context.beatmap.bookmarks.findIndex(
      (it) => it.time === command.time,
    );
    if (index === -1) {
      return;
    }
    context.beatmap.bookmarks.splice(index, 1);
    context.beatmap.onBookmarksChanged.emit();
  }

  createUndo(
    command: RemoveBookmarkCommand,
    context: CommandContext,
  ): EditorCommand | undefined {
    const bookmark = context.beatmap.bookmarks.find(
      (it) => it.time === command.time,
    );
    if (!bookmark) {
      return;
    }
    return EditorCommand.createBookmark({
      time: bookmark.time,
      name: bookmark.name,
    });
  }
}
