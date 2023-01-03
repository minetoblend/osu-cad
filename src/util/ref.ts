import {reactive, UnwrapNestedRefs} from "vue";
import {Presence} from "@/util/presence";


export function presenceAwareRef<T>(value: T) {
    return reactive({
        value,
        presence: []
    })
}


export type PresenceAwareRef<T, Extra = {}> = UnwrapNestedRefs<{
    value: T;
    readonly remote: boolean;
    presence: Presence<Extra>[];
}>

export type PresenceAwareReactive<T extends object | any[], Extra = {}> = UnwrapNestedRefs<T> & {
    readonly remote: boolean;
    presence: Presence<Extra>[];
}
