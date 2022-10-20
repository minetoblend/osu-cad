import {Command} from "./index";
import {ServerOpCode} from "@common/opcodes";


export const HitObjectOverrideCommand: Command<{ id: string, overrides: Record<string, any> }> = {
    execute(payload, message, state, ctx, logger, nk, dispatcher, tick) {
        const userId = state.presences[message.sender.sessionId].id
        const hitObject = state.beatmap.hitObjects.find(it => it.id === payload.id)
        if (hitObject && hitObject.selectedBy === userId)
            dispatcher.broadcastMessageDeferred(ServerOpCode.HitObjectOverride,
                JSON.stringify({
                    id: payload.id,
                    overrides: payload.overrides,
                }))
    }
}

