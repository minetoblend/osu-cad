import {CommandHandler} from "../command";
import {UpdateHitObjectCommand, UpdateHitObjectHandler} from "./updateHitObject";
import {fields, lookup, Lookup, TypeNames, variantModule, VariantOf, VariantsOfUnion} from "variant";
import {HitObject} from "../../osu";
import {
  CreateHitObjectCommand,
  CreateHitObjectHandler,
  DeleteHitObjectCommand,
  DeleteHitObjectHandler,
} from "./createHitObjects";
import {
  CreateBookmarkCommand,
  CreateBookmarkHandler,
  RemoveBookmarkCommand,
  RemoveBookmarkHandler,
} from "./bookmarkCommands";
import {encodeUuid} from "../../util";

export * from "./updateHitObject";
export * from "./encoder";

export const EditorCommand = variantModule({
  updateHitObject: fields<UpdateHitObjectCommand>(),
  createHitObject: fields<CreateHitObjectCommand>(),
  deleteHitObject: fields<DeleteHitObjectCommand>(),
  createBookmark: fields<CreateBookmarkCommand>(),
  removeBookmark: fields<RemoveBookmarkCommand>(),
});

export type EditorCommand<T extends TypeNames<typeof EditorCommand> = undefined> = VariantOf<typeof EditorCommand, T>

const commandHandlers: Lookup<VariantsOfUnion<EditorCommand>> = {
  updateHitObject: UpdateHitObjectHandler,
  createHitObject: CreateHitObjectHandler,
  deleteHitObject: DeleteHitObjectHandler,
  createBookmark: new CreateBookmarkHandler(),
  removeBookmark: new RemoveBookmarkHandler(),
};

export function getCommandHandler<T extends EditorCommand>(command: T): CommandHandler<T> {
  return lookup(command, commandHandlers);
}

export function updateHitObject(hitObject: HitObject, update: UpdateHitObjectCommand["update"]) {
  return EditorCommand.updateHitObject({
    hitObject: hitObject.id,
    update,
  });
}