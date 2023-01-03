import {ChangeTypes, Target, transactional} from "@/editor/transaction/transactional";
import {History} from "@/editor/transaction/history";
import {isIntegerKey, hasOwn, hasChanged} from '@vue/shared'

export const rawMarker = '__o_raw'

function createGetter(history: History) {
    return function get(target: Target, key: string | symbol, receiver: any) {
        if (key === rawMarker) {
            return target
        }

        const targetIsArray = Array.isArray(target)

        if (targetIsArray) {
            //todo
        }

        const res = Reflect.get(target, key)

        if (typeof res === 'object' && res !== null) {
            return transactional(res, history)
        }

        return res
    }
}

function createSetter(history: History) {
    return function set(target: Target, key: string | symbol, value: any, receiver: any) {
        let oldValue = (target as any)[key]

        const hadKey =
            Array.isArray(target) && isIntegerKey(key)
                ? Number(key) < target.length
                : hasOwn(target, key)
        const result = Reflect.set(target, key, value)

        if (typeof key === 'string') {
            if(key !== 'length' || !Array.isArray(target)) {
                if (!hadKey) {
                    history.track(target, ChangeTypes.ADD, key, value)
                } else if (hasChanged(value, oldValue)) {
                    history.track(target, ChangeTypes.SET, key, value, oldValue)
                }
            }
        }

        return result
    }
}

export function createDeleteProperty(history: History) {
    return function deleteProperty(target: Target, key: string | symbol) {
        const hadKey = hasOwn(target, key)
        const oldValue = (target as any)[key]
        const result = Reflect.deleteProperty(target, key)

        if (hadKey) {
            history.track(target, ChangeTypes.DELETE, key, undefined, oldValue)
        }

        return result
    }
}

export function createTransactionHandlers(history: History): ProxyHandler<object> {
    return {
        get: createGetter(history),
        set: createSetter(history),
        deleteProperty: createDeleteProperty(history),
    }
}
