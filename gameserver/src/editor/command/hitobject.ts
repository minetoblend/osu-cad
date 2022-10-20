import {Command} from "./index";
import {ServerOpCode} from "@common/opcodes";
import {HitObject} from "../state";
import {SerializedHitObject} from "@common/types";
import {
    deleteHitObjects,
    findHitObjectsByIds,
    findHitObjectsBySelection,
    insertHitObject,
    parseHitObject,
    setHitObjectSelection,
    updateHitObject
} from "../handlers/hitobject";
import {getSessionId} from "../handlers/match";


export const SelectHitObjectCommand: Command<{ ids: string[], selected: boolean, unique: true }> = {
    execute(payload, message, state, ctx, logger, nk, dispatcher, tick) {
        const sessionId = getSessionId(state, message.sender)

        const selectedHitObjects = findHitObjectsBySelection(state, sessionId)

        const hitObjects = findHitObjectsByIds(state, payload.ids)

        let failed = 0

        const selected: HitObject[] = []
        const deselected: HitObject[] = []


        if (hitObjects.length > 0 || selectedHitObjects.length > 0) {
            if (payload.unique) {
                selectedHitObjects.forEach(it => {
                    if (!payload.ids.some(id => id === it.id)) {
                        deselected.push(it)
                    }
                })
            }

            hitObjects.forEach(it => {
                if (it.selectedBy && it.selectedBy !== sessionId)
                    failed++
                else if (payload.selected && !it.selectedBy)
                    selected.push(it)
                else if (!payload.selected && it.selectedBy)
                    deselected.push(it)
            })

            setHitObjectSelection(state, selected, sessionId, dispatcher, 'none')
            setHitObjectSelection(state, deselected, null, dispatcher, 'none')
        }

        if (failed > 0 && failed === payload.ids.length) {
            dispatcher.broadcastMessageDeferred(ServerOpCode.FailedSelectionAttempt, JSON.stringify({
                id: sessionId
            }))
        }
    }
}


export const HitObjectUpdateCommand: Command<SerializedHitObject> = {
    execute(payload, message, state, ctx, logger, nk, dispatcher, tick) {
        const sessionId = getSessionId(state, message.sender)

        const hitObject = parseHitObject(payload, state, true, logger)

        if (hitObject && hitObject.id)
            updateHitObject(state, hitObject.id, hitObject, dispatcher, sessionId, true)
    }
}

export const HitObjectCreateCommand: Command<SerializedHitObject & { responseId?: string }> = {
    execute(payload, message, state, ctx, logger, nk, dispatcher, tick) {


        const userId = state.presences[message.sender.sessionId].id
        const id = nk.uuidv4()

        const responseId = payload.responseId

        const hitObject = parseHitObject(payload as SerializedHitObject, state, false, logger)
        if (!hitObject)
            return;

        hitObject.id = id
        hitObject.selectedBy = userId

        const oldSelection = state.beatmap.hitObjects.filter(it => it.selectedBy === userId)
        setHitObjectSelection(state, oldSelection, null, dispatcher, 'none')

        // state.beatmap.hitObjects.push(hitObject)

        insertHitObject(state, hitObject, dispatcher, userId, responseId)
    }
}


export const HitObjectDeleteCommand: Command<{ ids: string[] }> = {
    execute(payload, message, state, ctx, logger, nk, dispatcher, tick) {
        const userId = state.presences[message.sender.sessionId].id

        const hitObjects = findHitObjectsByIds(state, payload.ids)
            .filter(it => it.selectedBy === userId)
            .map(it => it.id)

        logger.info(`deleted ${hitObjects.join(',')}`)

        if (hitObjects.length > 0) {
            deleteHitObjects(state, hitObjects, dispatcher)
        }
    }

}

