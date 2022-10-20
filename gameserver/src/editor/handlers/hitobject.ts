import {EditorState, HitCircle, HitObject, Slider, SliderControlPoint} from "../state";
import {ServerOpCode} from "@common/opcodes";
import {
    SerializedHitCircle,
    SerializedSlider,
    SerializedSliderControlPoint,
    SerializedVec2,
    SliderControlPointType
} from "@common/types";
import {Vec2Equals} from "./util";
import MatchDispatcher = nkruntime.MatchDispatcher;
import Logger = nkruntime.Logger;

type SelectionCheckType = 'none' | 'filter' | 'error'

export function findHitObjectIndexByTime(hitObjects: HitObject[], time: number): { found: boolean, index: number } {
    let index = 0
    let left = 0;
    let right = hitObjects.length - 1;
    while (left <= right) {
        index = left + ((right - left) >> 1);
        let commandTime = hitObjects[index].time;
        if (commandTime == time)
            return {found: true, index};
        else if (commandTime < time)
            left = index + 1;
        else right = index - 1;
    }
    index = left;
    return {found: false, index};
}

export function findHitObjectsAtTime(hitObjects: HitObject[], time: number): HitObject[] {
    return hitObjects.filter(it => it.time === time)
}

function logInvalidHitObject(logger: Logger, field: string, data: any): null {
    logger.error(`Tried to parse faulty hitObject with invalid ${field}: ${JSON.stringify(data)}`)
    return null
}

export function parseVec2(serialized: any, round: boolean = false): SerializedVec2 | null {

    if (!serialized || typeof serialized.x !== "number" || typeof serialized.y !== "number")
        return null

    let x = serialized.x
    let y = serialized.y

    if (round) {
        x = Math.floor(x)
        y = Math.floor(y)
    }

    return {
        x,
        y
    }
}

export function parseHitObject(payload: any, state: EditorState, withId: boolean, logger: Logger): HitObject | null {
    if (!payload || typeof payload !== "object") {
        logger.error(`Tried to parse faulty hitObject: ${JSON.stringify(payload)}`)
        return null
    }
    const serialized = payload as SerializedHitCircle | SerializedSlider


    const hitObject: Partial<HitObject> = {}

    if (withId) {
        if (typeof serialized.id !== "string")
            return logInvalidHitObject(logger, 'id', serialized)

        hitObject.id = serialized.id
    }

    if (typeof serialized.time !== "number" || isNaN(serialized.time))
        return logInvalidHitObject(logger, 'time', serialized)

    hitObject.time = Math.floor(serialized.time)


    if (typeof serialized.newCombo !== "boolean")
        return logInvalidHitObject(logger, 'newCombo', serialized)
    hitObject.newCombo = serialized.newCombo

    if (serialized.selectedBy === null)
        hitObject.selectedBy = null
    else if (typeof serialized.selectedBy === "string") {
        if (Object.keys(state.presences).some(key => state.presences[key].id === serialized.selectedBy))
            hitObject.selectedBy = serialized.selectedBy
        else
            return logInvalidHitObject(logger, 'time', serialized)
    } else
        return logInvalidHitObject(logger, 'time', serialized)

    const position = parseVec2(serialized.position, true)
    if (!position)
        return logInvalidHitObject(logger, 'position', serialized)
    hitObject.position = position

    hitObject.type = serialized.type

    if (serialized.type === 'circle') {
        const circle = hitObject as Partial<HitCircle>

        // circle has no extra properties right now

        return circle as HitCircle
    } else if (serialized.type === 'slider') {
        const slider = hitObject as Partial<Slider>

        if (typeof serialized.repeatCount !== "number" || isNaN(serialized.repeatCount) || serialized.repeatCount < 1)
            return logInvalidHitObject(logger, 'repeatCount', serialized)
        slider.repeatCount = serialized.repeatCount

        if (typeof serialized.pixelLength !== "number" || isNaN(serialized.pixelLength) || serialized.pixelLength < 0)
            return logInvalidHitObject(logger, 'pixelLength', serialized)
        slider.pixelLength = serialized.pixelLength

        const controlPoints: SliderControlPoint[] = []
        if (Array.isArray(serialized.controlPoints)) {
            if (!serialized.controlPoints.every(s => {
                if (!s)
                    return false

                const controlPoint: Partial<SerializedSliderControlPoint> = {
                    position: parseVec2(s.position, true),
                    kind: s.kind
                }

                switch (controlPoint.kind) {
                    case SliderControlPointType.None:
                    case SliderControlPointType.Bezier:
                    case SliderControlPointType.Circle:
                    case SliderControlPointType.Linear:
                        break;
                    default:
                        return false;
                }

                controlPoints.push(controlPoint as SliderControlPoint)

                return true
            })) {
                return logInvalidHitObject(logger, 'controlPoints', serialized)
            }

            if (controlPoints.length < 2) {
                logger.error(`Tried to parse slider with less than 2 controlPoints: ${JSON.stringify(serialized)}`)
                return null
            }

            slider.controlPoints = controlPoints

        } else
            return logInvalidHitObject(logger, 'controlPoints', serialized)

        if (!Vec2Equals(slider.position, controlPoints[0].position)) {
            logger.error(`Tried to parse slider with first controlPoint not being it's position: ${JSON.stringify(serialized)}`)
            return null
        }

        return slider as Slider
    }
    return null
}

export function findHitObjectById(state: EditorState, id: string): HitObject | undefined {
    return state.beatmap.hitObjects.find(it => it.id === id)
}

export function findHitObjectsByIds(state: EditorState, ids: string[]): HitObject[] {
    return state.beatmap.hitObjects.filter(it => ids.some(id => it.id === id))
}

export function findHitObjectsBySelection(state: EditorState, selectedBy: string | null): HitObject[] {
    return state.beatmap.hitObjects.filter(it => it.selectedBy === selectedBy)
}


export function findHitObjectByIdWithIndex(state: EditorState, id: string): { found: boolean, index: number, hitObject: HitObject | null } {
    const index = state.beatmap.hitObjects.findIndex(it => it.id === id)
    if (index >= 0) {
        return {
            found: true,
            index,
            hitObject: state.beatmap.hitObjects[index]
        }
    }
    return {
        found: false,
        index: -1,
        hitObject: null
    }
}


export function updateHitObject(state: EditorState, id: string, hitObject: HitObject, dispatcher: MatchDispatcher, user: string | null, withChecks: boolean = true): boolean {
    const original = findHitObjectByIdWithIndex(state, id)
    if (!original.found)
        return false

    const originalHitObject = original.hitObject
    const index = original.index

    if (user)
        hitObject.selectedBy = user

    if (withChecks && originalHitObject.selectedBy && originalHitObject.selectedBy !== hitObject.selectedBy)
        return false

    state.beatmap.hitObjects[index] = hitObject

    dispatcher.broadcastMessageDeferred(ServerOpCode.HitObjectUpdated, JSON.stringify(hitObject))

    return true
}

export function setHitObjectSelection(state: EditorState, hitObjects: HitObject[], selectedBy: string | null, dispatcher: MatchDispatcher, checks: SelectionCheckType = 'filter'): boolean {
    if (hitObjects.length === 0)
        return true;

    if (checks === 'filter' && selectedBy)
        hitObjects = hitObjects.filter(it => !(it.selectedBy && it.selectedBy !== selectedBy))
    else if (checks === 'error' && selectedBy) {
        if (hitObjects.some(it => !(it.selectedBy && it.selectedBy !== selectedBy))) {
            return false
        }
    }

    hitObjects.forEach(it => it.selectedBy = selectedBy)
    dispatcher.broadcastMessageDeferred(ServerOpCode.HitObjectSelection, JSON.stringify({
        ids: hitObjects.map(it => it.id),
        selectedBy: selectedBy
    }))
    return true
}

export function deleteHitObjects(state: EditorState, ids: string[], dispatcher: MatchDispatcher) {
    if (ids.length > 0) {

        ids.forEach(id => {
            const index = state.beatmap.hitObjects.findIndex(it => it.id === id)
            if (index >= 0) {
                state.beatmap.hitObjects.splice(index, 1)
            }
        })

        dispatcher.broadcastMessageDeferred(ServerOpCode.HitObjectDeleted, JSON.stringify({
            ids
        }))
    }
}

export function insertHitObject(state: EditorState, hitObject: HitObject, dispatcher: MatchDispatcher, userId: string, responseId?: string) {
    const hitObjectsAtTime = findHitObjectsAtTime(state.beatmap.hitObjects, hitObject.time)

    const shouldDelete = hitObjectsAtTime.filter(it => it.selectedBy === null || it.selectedBy === userId)

    const index = findHitObjectIndexByTime(state.beatmap.hitObjects, hitObject.time).index

    state.beatmap.hitObjects.splice(index, 0, hitObject)

    const response = {
        responseId
    }

    Object.assign(response, hitObject)

    deleteHitObjects(state, shouldDelete.map(it => it.id), dispatcher)
    dispatcher.broadcastMessageDeferred(ServerOpCode.HitObjectCreated, JSON.stringify(response))
}