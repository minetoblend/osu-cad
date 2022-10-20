import {rpcHealthcheck} from './healthcheck'
import {EditorHandler, EditorModule, rpcGetMatchForBeatmap} from "./editor";
import {BeforeAuthenticateOsucad} from "./auth";

function InitModule(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, initializer: nkruntime.Initializer) {
    initializer.registerRpc('healthcheck', rpcHealthcheck)
    logger.info('Javascript module loaded')

    initializer.registerMatch(EditorModule, EditorHandler)

    initializer.registerRpc('GetMatchForBeatmap', rpcGetMatchForBeatmap)

    initializer.registerBeforeAuthenticateCustom(BeforeAuthenticateOsucad)
}

// Reference InitModule to avoid it getting removed on build
!InitModule && InitModule.bind(null);