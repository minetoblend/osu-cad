import {Command} from "./index";
import {EditorState, TimingPoint} from "../state";
import {ServerOpCode} from "@common/opcodes";
import {SerializedTimingPoint} from "@common/types";

function findTimingPointIndex(timingPoints: TimingPoint[], time: number): { found: boolean, index: number } {
    let index = 0
    let left = 0;
    let right = timingPoints.length - 1;
    while (left <= right) {
        index = left + ((right - left) >> 1);
        let commandTime = timingPoints[index].time;
        if (commandTime == time)
            return {found: true, index};
        else if (commandTime < time)
            left = index + 1;
        else right = index - 1;
    }
    index = left;
    return {found: false, index};
}


export const CreateTimingPointCommand: Command<{ time: number }> = {
    execute({time}, message, state: EditorState, ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, dispatcher: nkruntime.MatchDispatcher, tick: number) {

        const timingPoint: TimingPoint = {
            id: nk.uuidv4(),
            time,
        }
        const {index} = findTimingPointIndex(state.beatmap.timingPoints, timingPoint.time)

        state.beatmap.timingPoints.splice(index, 0, timingPoint)

        dispatcher.broadcastMessageDeferred(ServerOpCode.TimingPointAdded, JSON.stringify(timingPoint))
    }
}

export const DeleteTimingPointCommand: Command<{ id: string }> = {
    execute({id}, message, state: EditorState, ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, dispatcher: nkruntime.MatchDispatcher, tick: number) {

        const index = state.beatmap.timingPoints.findIndex(it => it.id === id)
        if (index >= 0) {
            state.beatmap.timingPoints.splice(index, 1)
            dispatcher.broadcastMessageDeferred(ServerOpCode.TimingPointRemoved, JSON.stringify({id}))
        }
    }
}

export const UpdateTimingPointCommand: Command<SerializedTimingPoint> = {
    execute(serialized, message, state: EditorState, ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, dispatcher: nkruntime.MatchDispatcher, tick: number) {

        const index = state.beatmap.timingPoints.findIndex(it => it.id === serialized.id)
        if (index >= 0) {
            const timingpoint = state.beatmap.timingPoints[index]

            timingpoint.time = serialized.time
            timingpoint.timing = serialized.timing
            timingpoint.sv = serialized.sv
            timingpoint.volume = serialized.volume

            dispatcher.broadcastMessageDeferred(ServerOpCode.TimingPointUpdated, JSON.stringify(timingpoint))
        }
    }
}