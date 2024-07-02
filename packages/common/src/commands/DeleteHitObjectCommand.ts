import { BaseCommand } from './BaseEditorCommand';
import { CommandContext } from './CommandContext';
import { CommandHandler } from './CommandHandler';
import { IEditorCommand } from './IEditorCommand';
import { CreateHitObjectCommand } from './CreateHitObjectCommand';
import { registerCommand } from './commandHandlerts';
import { HitObject } from '../osu';

export interface IDeleteHitObjectCommand extends IEditorCommand {
  hitObjectId: HitObject['id'];
}

export class DeleteHitObjectCommand
  extends BaseCommand
  implements IDeleteHitObjectCommand
{
  hitObjectId: HitObject['id'];

  constructor(hitObjectOrId: HitObject['id'] | HitObject) {
    super(DeleteHitObjectHandler);

    if (typeof hitObjectOrId === 'string') {
      this.hitObjectId = hitObjectOrId;
    } else {
      this.hitObjectId = hitObjectOrId.id;
    }
  }
}

export class DeleteHitObjectHandler extends CommandHandler<IDeleteHitObjectCommand> {
  override get command() {
    return 'deleteHitObject';
  }

  override apply(
    { hitObjects }: CommandContext,
    command: IDeleteHitObjectCommand,
  ): void {
    const hitObject = hitObjects.getById(command.hitObjectId);

    if (hitObject) {
      hitObjects.remove(hitObject);
    }
  }

  override createUndoCommand(
    { hitObjects }: CommandContext,
    command: IDeleteHitObjectCommand,
  ): IEditorCommand | null {
    const hitObject = hitObjects.getById(command.hitObjectId);
    if (hitObject) {
      return new CreateHitObjectCommand(hitObject.serialize());
    }

    return null;
  }
}

registerCommand(new DeleteHitObjectHandler());
