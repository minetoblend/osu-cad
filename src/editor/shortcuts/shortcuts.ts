import {computed, ComputedRef, reactive, Ref} from "vue";
import {useMagicKeys} from "@vueuse/core";

function defineShortcuts<T extends Record<string, string | null>>(shortcuts: T) {
    return reactive(shortcuts as {
        [K in keyof T]: string | null
    });
}

export const shortcuts = defineShortcuts({
    'delete': 'Delete',

    'grid.tiny': 'ctrl+1',
    'grid.small': 'ctrl+2',
    'grid.medium': 'ctrl+3',
    'grid.large': 'ctrl+4',
})

export type Shortcuts = typeof shortcuts;

export function useShortcut<T extends keyof Shortcuts>(shortcut: T): ComputedRef<boolean> {
    const keys = useMagicKeys()

    return computed(() => {

        if (shortcuts[shortcut] === null)
            return false
        return keys[shortcuts[shortcut] as string].value
    })
}
