import {EditorModule} from ".";

export const rpcGetMatchForBeatmap: nkruntime.RpcFunction = (ctx, logger, nk, payload) => {
    const {beatmap} = JSON.parse(payload)

    const matches = nk.matchList(1, true, beatmap)

    if (matches.length > 0) {
        return JSON.stringify({
            match: matches[0].matchId
        })
    }


    const match = nk.matchCreate(EditorModule, {
        beatmap
    })

    return JSON.stringify({
        match
    })
}