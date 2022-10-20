import {Command} from "./index";
import {SerializedVec2} from "@common/types";

export const SetCurrentTimeCommand: Command<{ time: number }> = {
    execute(payload, message, state, ctx, logger, nk, dispatcher, tick) {
        if (state.presences[message.sender.sessionId])
            state.presences[message.sender.sessionId].currentTime = payload.time
    }
}

export const SetCursorPosCommand: Command<{ pos: SerializedVec2 | null }> = {
    execute(payload, message, state, ctx, logger, nk, dispatcher, tick) {
        if (state.presences[message.sender.sessionId])

            state.presences[message.sender.sessionId].cursorPos = payload.pos
    }
}