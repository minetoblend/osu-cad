import {readonly, shallowReactive, unref} from "vue";
import {ChangeTypes, Target} from "@/editor/transaction/transactional";
import {MaybeComputedRef} from "@vueuse/core";

function undoChange(change: Change) {
    console.log('undoChange', change);
    switch (change.type) {
        case ChangeTypes.SET:
            (change.target as any)[change.key] = change.oldValue
            break
        case ChangeTypes.ADD:
            if (Array.isArray(change.target)) {
                change.target.splice(change.key as any, 1)
            } else {
                delete (change.target as any)[change.key]
            }
            break
        case ChangeTypes.DELETE:
            if (Array.isArray(change.target)) {
                change.target.splice(change.key as any, 0, change.oldValue)
            } else {
                (change.target as any)[change.key] = change.oldValue
            }
    }
}

export function createHistory(maxHistoryLength: MaybeComputedRef<any> = 50) {
    const undoHistory = shallowReactive<HistoryEntry[]>([])
    const redoHistory = shallowReactive<HistoryEntry[]>([])

    function append(entry: HistoryEntry) {
        undoHistory.push(entry)
        if (redoHistory.length)
            redoHistory.splice(0, redoHistory.length)

        while (undoHistory.length > unref(maxHistoryLength))
            undoHistory.shift()

        console.log(entry)
    }

    function undo() {
        let entry = undoHistory.pop()
        if (entry) {
            redoHistory.push(entry)
            entry.changes.forEach(change => {
                undoChange(change)
            })
        }
    }

    function redo() {
        let entry = redoHistory.pop()
        if (entry) {
            undoHistory.push(entry)
            entry.changes.forEach(change => {
                change.target[change.key] = change.value
            })
        }
    }


    let currentTransaction: PendingTransaction | null = null

    function track(target: Target, type: ChangeTypes, key: string, value: any, oldValue?: any) {
        if (!currentTransaction)
            return

        let changes = currentTransaction.changes.get(target)
        if (!changes) {
            currentTransaction.changes.set(target, changes = [])
        }

        const existing = changes.findIndex(change => change.key === key)
        if (existing >= 0) {
            changes[existing] = {
                type,
                target,
                key,
                value,
                oldValue: changes[existing].oldValue
            }
        } else {
            changes.push({
                type,
                target,
                key,
                value,
                oldValue
            })
        }
    }

    function commit() {
        if (currentTransaction && currentTransaction.changes.size) {
            append({
                name: currentTransaction.name,
                changes: Array.from(currentTransaction.changes.values()).flat()
            })
            currentTransaction = null
        }
    }

    function rollback() {
        if (currentTransaction) {
            currentTransaction.changes.forEach(changes => {
                changes.forEach(change => {
                    switch (change.type) {
                        case ChangeTypes.ADD:
                            (change.target as any[]).splice(parseInt(change.key), 1)
                            break
                        case ChangeTypes.DELETE:
                            (change.target as any[]).splice(parseInt(change.key), 0, change.oldValue!)
                            break
                        case ChangeTypes.SET:
                            (change.target as any)[change.key] = change.oldValue
                            break
                        case ChangeTypes.CLEAR:
                            (change.target as any[]).splice(0, (change.target as any[]).length, ...change.oldValue!)
                    }
                })
            })
        }
        currentTransaction = null
    }

    function beginTransaction(name: string) {
        commit()
        currentTransaction = {
            name,
            changes: new Map<Target, Change[]>()
        }
    }

    function record(name: string, fn: (() => void)) {
        beginTransaction(name)
        fn()
        commit()

    }

    return {
        undoHistory: readonly(undoHistory),
        redoHistory: readonly(redoHistory),
        append,
        undo,
        redo,
        track,
        commit,
        rollback,
        record,
        beginTransaction
    }
}

export interface Transaction {
    name: string
    changes: Change[]
}

export interface PendingTransaction {
    name: string
    changes: Map<Target, Change[]>
}

export interface HistoryEntry {
    name: string | null
    changes: any[]
}

export interface Change {
    type: ChangeTypes
    target: Target
    key: string
    value: any
    oldValue?: any
}

export type History = ReturnType<typeof createHistory>
