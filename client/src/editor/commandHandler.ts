import {EditorContext} from "@/editor/index";
import {MatchEvent} from "@/editor/connector";
import {ServerOpCode} from "@common/opcodes";
import {Subject} from "rxjs";

export class CommandHandler {

    constructor(readonly ctx: EditorContext) {
    }

    get state() {
        return this.ctx.state
    }

    readonly onCommand = new Subject<{ opCode: ServerOpCode, payload: any }>()

    handleMatchEvent({opCode, payload}: MatchEvent) {

        switch (opCode) {
            case ServerOpCode.InitializeState:
                this.state.beatmap.update(payload.beatmap)
                break

            //general
            case ServerOpCode.UserList:
                this.state.user.update(payload)
                break

            case ServerOpCode.JoinInfo:
                this.state.user.setJoinInfo(payload)
                break

            //hitobject

            case ServerOpCode.HitObjectSelection:
                this.state.beatmap.hitobjects.setSelectedBy(payload.ids, payload.selectedBy)
                break

            //timing
            case ServerOpCode.TimingPointAdded:
                this.state.beatmap.timing.addSerialized(payload)
                break
            case ServerOpCode.TimingPointUpdated:
                this.state.beatmap.timing.updateTimingPoint(payload)
                break
            case ServerOpCode.TimingPointRemoved:
                this.state.beatmap.timing.removeTimingPoint(payload.id)
                break
        }


        this.onCommand.next({
            opCode,
            payload
        })

    }

}