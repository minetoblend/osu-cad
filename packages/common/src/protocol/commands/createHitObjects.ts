import { SerializedHitObject } from '../../types';
import { CommandContext, CommandHandler } from '../command';
import { deserializeHitObject } from '../../osu/deserializeHitObject';
import { EditorCommand } from './index';

export interface CreateHitObjectCommand {
  hitObject: SerializedHitObject;
}

export const CreateHitObjectHandler: CommandHandler<CreateHitObjectCommand> = {
  apply(command, context) {
    if (context.local || (!context.local && !context.own)) {
      context.hitObjects.add(deserializeHitObject(command.hitObject));
    }
  },
  createUndo(command: CreateHitObjectCommand): EditorCommand | undefined {
    if (command.hitObject.id)
      return EditorCommand.deleteHitObject({
        id: command.hitObject.id,
      });
  },
};

export interface DeleteHitObjectCommand {
  id: string;
}

export const DeleteHitObjectHandler: CommandHandler<DeleteHitObjectCommand> = {
  apply(command, context) {
    if (context.local || (!context.local && !context.own)) {
      const hitObject = context.hitObjects.getById(command.id);
      if (hitObject) {
        context.hitObjects.remove(hitObject);
      }
    }
  },
  createUndo(
    command: DeleteHitObjectCommand,
    context: CommandContext,
  ): EditorCommand | undefined {
    const hitObject = context.hitObjects.getById(command.id);
    if (hitObject) {
      return EditorCommand.createHitObject({
        hitObject: hitObject.serialize(),
      });
    }
  },
};
