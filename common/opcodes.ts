export const enum ServerOpCode {
    Noop,
    //HitObjects
    HitObjectSelection,
    FailedSelectionAttempt,

    HitObjectCreated,
    HitObjectUpdated,
    HitObjectDeleted,
    HitObjectOverride,


}

export const enum ClientOpCode {
    Noop,
    HitObjectOverride,
}


export type ClientMessages = {
    [ClientOpCode.HitObjectOverride](payload: { id: number, overrides: Record<string, any> }): void
}