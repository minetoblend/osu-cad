import MatchTerminateFunction = nkruntime.MatchTerminateFunction;
import MatchHandler = nkruntime.MatchHandler;
import {createEditorState, EditorState} from "./state";
import {ServerOpCode} from "@common/opcodes";
import {getCommand} from "./command";
import {addPresence, removePresence, saveBeatmap} from "./handlers/match";


export const matchInit: nkruntime.MatchInitFunction<EditorState> = function (ctx, logger, nk, params) {

    let beatmapDataResponse = nk.httpRequest('http://api:3000/beatmap/' + params.beatmap, 'get')

    const state = createEditorState(JSON.parse(beatmapDataResponse.body), nk)

    return {
        state,
        tickRate: 20,
        label: params.beatmap
    }
}

export const matchJoin: nkruntime.MatchJoinFunction<EditorState> = function (ctx, logger, nk, dispatcher, tick, state, presences) {

    presences.forEach(presence => {
        const presenceState = state.presences[presence.sessionId]
        dispatcher.broadcastMessageDeferred(ServerOpCode.JoinInfo, JSON.stringify({
            'sessionId': presenceState.id,
        }), [presence])
    })

    return {
        state
    };
}

export const matchJoinAttempt: nkruntime.MatchJoinAttemptFunction<EditorState> = function (ctx, logger, nk, dispatcher, tick: number, state, presence, metadata) {
    logger.debug('%q attempted to join Lobby match', ctx.userId);

    addPresence(state, presence, nk)

    return {
        state,
        accept: true
    };
}

export const matchLeave: nkruntime.MatchLeaveFunction<EditorState> = function (ctx, logger, nk, dispatcher, tick, state, presences) {

    presences.forEach(presence => removePresence(state, presence, nk, dispatcher));

    return {
        state
    };
}

export const matchLoop: nkruntime.MatchLoopFunction<EditorState> = function (ctx, logger, nk, dispatcher, tick, state, messages) {
    if (Object.keys(state.presences).length === 0) {
        state.emptyTicks++;
        if (state.emptyTicks > 60 * ctx.matchTickRate) //end the match after a minute
            return null;
    } else state.emptyTicks = 0


    //send (full) state to all clients that need it (i.e. when they just joined)
    dispatcher.broadcastMessage(ServerOpCode.InitializeState, JSON.stringify({beatmap: state.beatmap}), state.needsState)
    state.needsState = []

    messages.forEach(message => {
        const payload = JSON.parse(nk.binaryToString(message.data))

        const command = getCommand(message.opCode)

        if (command) {
            command.execute(payload, message, state, ctx, logger, nk, dispatcher, tick)
        }
    })

    if (tick % 1 === 0) {
        dispatcher.broadcastMessageDeferred(ServerOpCode.UserList, JSON.stringify(Object.keys(state.presences).map(key => ({
            id: state.presences[key].id,
            userId: state.presences[key].presence.userId,
            username: state.presences[key].presence.username,
            currentTime: state.presences[key].currentTime,
            cursorPos: state.presences[key].cursorPos,
        }))))
    }

    if(tick % 300 === 0) { // 30 seconds
        saveBeatmap(nk, state, ctx)
    }

    return {
        state
    };

}

export const matchTerminate: MatchTerminateFunction<EditorState> = function (ctx, logger, nk, dispatcher, tick, state, graceSeconds) {
    logger.debug('Lobby match terminated');

    return {
        state
    };
}

export const matchSignal: nkruntime.MatchSignalFunction<EditorState> = function (ctx, logger, nk, dispatcher, tick, state, data) {
    logger.debug('Lobby match signal received: ' + data);

    return {
        state,
        data: "Lobby match signal received: " + data
    };
}

export const EditorHandler: MatchHandler<EditorState> = {
    matchInit,
    matchJoin,
    matchJoinAttempt,
    matchLeave,
    matchLoop,
    matchTerminate,
    matchSignal
}