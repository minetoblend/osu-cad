import {EditorState} from "../state";
import {setHitObjectSelection} from "./hitobject";
import Presence = nkruntime.Presence;
import Nakama = nkruntime.Nakama;
import Context = nkruntime.Context;

export function addPresence(state: EditorState, presence: Presence, nk: nkruntime.Nakama) {
    state.needsState.push(presence)
    state.presences[presence.sessionId] = {
        presence,
        currentTime: 0,
        cursorPos: null,
        id: nk.uuidv4(),
    }
}

export function removePresence(state: EditorState, presence: Presence, nk: nkruntime.Nakama, dispatcher: nkruntime.MatchDispatcher) {
    const sessionId = getSessionId(state, presence)
    if (!sessionId)
        return;

    const selectedHitObjects = state.beatmap.hitObjects.filter(it => it.selectedBy === sessionId)
    setHitObjectSelection(state, selectedHitObjects, null, dispatcher, 'none')

    delete (state.presences[presence.sessionId]);
}

export function getSessionId(state: EditorState, presence: Presence): string | undefined {
    if (state.presences[presence.sessionId])
        return state.presences[presence.sessionId].id
    return undefined
}

export function saveBeatmap(nk: Nakama, state: EditorState, ctx: Context) {
    nk.httpRequest(`http://api:3000/beatmap/${ctx.matchLabel}/`, "post", {
        'Content-Type': 'application/json'
    }, JSON.stringify({
        version: 1,
        hitObjects: state.beatmap.hitObjects,
        timingPoints: state.beatmap.timingPoints,
        difficulty: state.beatmap.difficulty
    }))
}