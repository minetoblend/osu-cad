import { ControlPoint, SerializedControlPoint } from '../../osu';
import { CommandContext, CommandHandler } from '../command';
import { EditorCommand } from './index';

export interface CreateControlPointCommand {
  controlPoint: SerializedControlPoint;
}

export const CreateControlPointHandler: CommandHandler<CreateControlPointCommand> =
  {
    apply(command, context) {
      if (context.local || (!context.local && !context.own)) {
        context.controlPoints.add(new ControlPoint(command.controlPoint));
      }
    },
    createUndo(command: CreateControlPointCommand): EditorCommand | undefined {
      if (command.controlPoint.id)
        return EditorCommand.deleteControlPoint({
          id: command.controlPoint.id,
        });
    },
  };

export interface DeleteControlPointCommand {
  id: string;
}

export const DeleteControlPointHandler: CommandHandler<DeleteControlPointCommand> =
  {
    apply(command, context) {
      if (context.local || (!context.local && !context.own)) {
        const controlPoint = context.controlPoints.getById(command.id);
        if (controlPoint) {
          context.controlPoints.remove(controlPoint);
        }
      }
    },
    createUndo(
      command: DeleteControlPointCommand,
      context: CommandContext,
    ): EditorCommand | undefined {
      const controlPoint = context.controlPoints.getById(command.id);
      if (controlPoint) {
        return EditorCommand.createControlPoint({
          controlPoint: controlPoint.serialize(),
        });
      }
    },
  };

export interface UpdateControlPointCommand {
  controlPoint: string;
  update: Partial<SerializedControlPoint>;
}

const key = '_pendingInfo';

interface PendingInfo {
  [key: string]: number;
}

export const UpdateControlPointHandler: CommandHandler<UpdateControlPointCommand> =
  {
    apply(command, context): void {
      const controlPoint = context.controlPoints.getById(command.controlPoint);
      if (!controlPoint) return;

      if (context.local) {
        for (const key in command.update) {
          setPendingInfo(controlPoint, key, context.version);
        }
        controlPoint.patch(command.update);
      } else if (context.own) {
        const pending = getPendingInfo(controlPoint);
        for (const key in command.update) {
          if (pending[key] === context.version) {
            delete pending[key];
          }
        }
      } else {
        const pending = getPendingInfo(controlPoint);
        const update = {} as any;
        for (const key in command.update) {
          if (pending[key] === undefined) {
            update[key] = command.update[key];
          }
        }
        controlPoint.patch(update);
      }
    },
    createUndo(command, context) {
      const controlPoint = context.controlPoints.getById(command.controlPoint);
      if (!controlPoint) return;

      const update = {} as any;
      const serialized = controlPoint.serialize();
      for (const key in command.update) {
        update[key] = serialized[key];
      }
      return {
        type: 'updateControlPoint',
        controlPoint: command.controlPoint,
        update: update,
      };
    },
    merge(
      a: UpdateControlPointCommand,
      b: UpdateControlPointCommand,
    ): EditorCommand | undefined {
      if (a.controlPoint === b.controlPoint) {
        return {
          type: 'updateControlPoint',
          controlPoint: a.controlPoint,
          update: {
            ...a.update,
            ...b.update,
          },
        };
      }
    },
  };

function getPendingInfo(controlPoint: ControlPoint) {
  if (!controlPoint[key]) {
    (controlPoint[key] as PendingInfo) = {};
  }
  return controlPoint[key] as PendingInfo;
}

function setPendingInfo(
  controlPoint: ControlPoint,
  key: string,
  version: number,
) {
  getPendingInfo(controlPoint)[key] = version;
}
