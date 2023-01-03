import {History} from "@/editor/transaction/history";
import {createTransactionHandlers, rawMarker} from "@/editor/transaction/handlers";

export interface Target {

}

const proxyMap = new WeakMap<Target, object>()

export function transactional<T extends object>(target: T, history: History, transactionHandlers = createTransactionHandlers(history)): T {
    const existingProxy = proxyMap.get(target)

    if (existingProxy)
        return existingProxy as T

    const proxy = new Proxy<T>(target, transactionHandlers)

    proxyMap.set(target, proxy)

    return proxy
}

export function untracked<T extends object>(target: T): T {
    return (target as any)[rawMarker] as T ?? target
}

export const enum ChangeTypes {
    SET = 'set',
    ADD = 'add',
    DELETE = 'delete',
    CLEAR = 'clear',
}
