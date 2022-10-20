import Context = nkruntime.Context;
import {EditorState} from "../state";
import {ClientOpCode} from "@common/opcodes";
import {CreateTimingPointCommand, DeleteTimingPointCommand, UpdateTimingPointCommand} from "./timing";
import {SetCurrentTimeCommand, SetCursorPosCommand} from "./general";
import {
    HitObjectCreateCommand,
    HitObjectDeleteCommand,
    HitObjectUpdateCommand,
    SelectHitObjectCommand
} from "./hitobject";
import {HitObjectOverrideCommand} from "./hitobject.override";

export interface Command<T extends Object> {

    execute(
        payload: T, message: nkruntime.MatchMessage, state: EditorState, ctx: Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, dispatcher: nkruntime.MatchDispatcher, tick: number
    ): void;

}


const commands: Record<ClientOpCode, Command<any> | null> = {
    // General
    [ClientOpCode.CurrentTime]: SetCurrentTimeCommand,
    [ClientOpCode.CursorPos]: SetCursorPosCommand,

    // HitObjects

    [ClientOpCode.SelectHitObject]: SelectHitObjectCommand,

    [ClientOpCode.HitObjectOverride]: HitObjectOverrideCommand,
    [ClientOpCode.CreateHitObject]: HitObjectCreateCommand,
    [ClientOpCode.UpdateHitObject]: HitObjectUpdateCommand,
    [ClientOpCode.DeleteHitObject]: HitObjectDeleteCommand,

    // Timing

    [ClientOpCode.CreateTimingPoint]: CreateTimingPointCommand,
    [ClientOpCode.DeleteTimingPoint]: DeleteTimingPointCommand,
    [ClientOpCode.UpdateTimingPoint]: UpdateTimingPointCommand,
    [ClientOpCode.Noop]: null
}

export function getCommand(opCode: ClientOpCode): Command<any> | undefined {


    return commands[opCode]
}

