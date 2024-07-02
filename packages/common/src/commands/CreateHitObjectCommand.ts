import { CommandHandler } from './CommandHandler';
import type { IEditorCommand } from './IEditorCommand';
import { CommandContext } from './CommandContext';
import { BaseCommand } from './BaseEditorCommand';
import { registerCommand } from './commandHandlerts';
import { DeleteHitObjectCommand } from './DeleteHitObjectCommand';
import { SerializedHitObject } from '../types';
import { HitObject, deserializeHitObject, hitObjectId } from '../osu';

export interface ICreateHitObjectCommand extends IEditorCommand {
  hitObject: SerializedHitObject;
}

export class CreateHitObjectCommand
  extends BaseCommand
  implements ICreateHitObjectCommand
{
  version = 0;
  hitObject: SerializedHitObject;

  constructor(hitObject: SerializedHitObject | HitObject) {
    super(CreateHitObjectHandler);

    if (hitObject instanceof HitObject) {
      hitObject = hitObject.serialize();
    }

    if (!hitObject.id) {
      hitObject.id = hitObjectId();
    }

    this.hitObject = hitObject;
  }
}

export class CreateHitObjectHandler extends CommandHandler<ICreateHitObjectCommand> {
  override get command() {
    return 'createHitObject';
  }

  override apply(
    { hitObjects }: CommandContext,
    command: ICreateHitObjectCommand,
  ): void {
    const hitObject = deserializeHitObject(command.hitObject);

    if (hitObjects.getById(hitObject.id)) {
      throw new Error(`HitObject with id ${hitObject.id} already exists`);
    }

    hitObjects.add(hitObject);
  }

  override createUndoCommand(
    { hitObjects }: CommandContext,
    command: ICreateHitObjectCommand,
  ): IEditorCommand | null {
    if (command.hitObject.id) {
      return new DeleteHitObjectCommand(command.hitObject.id);
    }

    return null;
  }
}

registerCommand(new CreateHitObjectHandler());
