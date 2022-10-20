import {SerializedHitObject, SerializedTimingPoint, SerializedVec2} from "./types";

export const enum ServerOpCode {
    Noop,

    JoinInfo,
    InitializeState,

    //HitObjects
    HitObjectSelection,
    FailedSelectionAttempt,

    HitObjectCreated,
    HitObjectUpdated,
    HitObjectDeleted,
    HitObjectOverride,


    //timing
    UserList,
    TimingPointAdded,
    TimingPointUpdated,
    TimingPointRemoved,


}

export const enum ClientOpCode {
    Noop,

    CurrentTime,
    CursorPos,

    //hitobjects
    SelectHitObject,
    CreateHitObject,
    UpdateHitObject,
    DeleteHitObject,

    HitObjectOverride,

    //timing
    CreateTimingPoint,
    UpdateTimingPoint,
    DeleteTimingPoint,

}

export interface ServerMessages {
    [ServerOpCode.InitializeState](): void
}


export type ClientMessages = {
    [ClientOpCode.CursorPos](payload: { pos: SerializedVec2 | null }): void
    [ClientOpCode.CurrentTime](payload: { time: number }): void

    [ClientOpCode.SelectHitObject](payload: { ids: string[], selected: boolean, unique: boolean }): void
    [ClientOpCode.CreateHitObject](payload: SerializedHitObject | Omit<SerializedHitObject, 'id'>): void
    [ClientOpCode.UpdateHitObject](payload: SerializedHitObject): void
    [ClientOpCode.DeleteHitObject](payload: { ids: string[] }): void

    [ClientOpCode.HitObjectOverride](payload: { id: string, overrides: Record<string, any> }): void

    [ClientOpCode.CreateTimingPoint](payload: { time: number }): void
    [ClientOpCode.UpdateTimingPoint](payload: SerializedTimingPoint): void
    [ClientOpCode.DeleteTimingPoint](payload: { id: string }): void
}