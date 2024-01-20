import {VersionedEditorCommand} from "../client";
import * as msgpack from "@ygoe/msgpack";
import {match} from "variant";
import {EditorCommand, UpdateHitObjectCommand} from "./index";
import {SerializedHitCircle, SerializedHitObject, SerializedSlider, SerializedSpinner} from "../../types";
import * as uuid from "uuid";

export function encodeCommands(commands: VersionedEditorCommand[]) {
  // const minified = (commands.map(command => {
  //   return {
  //     v: command.version,
  //     c: encodeCommand(command.command),
  //   };
  // }));

  return msgpack.encode(commands);
}

type EncodedCommand =
  | { t: 0, h: SerializedHitObject, }
  | { t: 1, h: string, u: any }
  | { t: 2, h: string, }
  | { t: 3, n: string, r: number, }
  | { t: 4, r: number, };


function encodeCommand(command: EditorCommand): EncodedCommand {
  return match(command, {
    createHitObject(payload) {
      return {
        t: 0,
        h: payload.hitObject,
      } as EncodedCommand;
    },
    updateHitObject(payload) {
      return {
        t: 1,
        h: payload.hitObject,
        u: encodeHitObjectUpdate(payload.update),
      } as EncodedCommand;
    },
    deleteHitObject(payload) {
      return {
        t: 2,
        h: payload.id,
      } as EncodedCommand;
    },
    createBookmark(payload) {
      return {
        t: 3,
        n: payload.name,
        r: payload.time,
      } as EncodedCommand;
    },
    removeBookmark(payload) {
      return {
        t: 4,
        r: payload.time,
      } as EncodedCommand;
    },
  });
}


function decodeCommand(command: EncodedCommand): EditorCommand {
  switch (command.t) {
    case 0:
      return EditorCommand.createHitObject({
        hitObject: command.h,
      });
    case 1:
      return EditorCommand.updateHitObject({
        hitObject: command.h,
        update: decodeHitObjectUpdate(command.u),
      });
    case 2:
      return EditorCommand.deleteHitObject({
        id: command.h,
      });
    case 3:
      return EditorCommand.createBookmark({
        name: command.n,
        time: command.r,
      });
    case 4:
      return EditorCommand.removeBookmark({
        time: command.r,
      });
  }
}

export function decodeCommands(data: Uint8Array): VersionedEditorCommand[] {
  const commands = msgpack.decode(data);
  return commands;
  // return commands.map((command: any) => {
  //   return {
  //     version: command.v,
  //     command: decodeCommand(command.c),
  //   };
  // });
}

function encodeHitObjectUpdate(update: Partial<
  Omit<SerializedHitCircle, "type"> &
  Omit<SerializedSlider, "type"> &
  Omit<SerializedSpinner, "type">
>) {

  const encoded: any = {};

  if (update.startTime !== undefined) encoded.a = update.startTime;
  if (update.position !== undefined) encoded.c = update.position;
  if (update.newCombo !== undefined) encoded.b = update.newCombo;
  if (update.duration !== undefined) encoded.d = update.duration;
  if (update.path !== undefined) encoded.e = update.path;
  if (update.repeats !== undefined) encoded.f = update.repeats;
  if (update.expectedDistance !== undefined) encoded.g = update.expectedDistance;
  if (update.velocity !== undefined) encoded.h = update.velocity;
  if (update.comboOffset !== undefined) encoded.i = update.comboOffset;

  return encoded;
}

function decodeHitObjectUpdate(update: any): Partial<SerializedHitObject> {
  return {
    startTime: update.a,
    position: update.c,
    newCombo: update.b,
    duration: update.d,
    path: update.e,
    repeats: update.f,
    expectedDistance: update.g,
    velocity: update.h,
    comboOffset: update.i,
  };
}