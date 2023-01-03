import {reactive, UnwrapRef, watchEffect} from "vue";

export function useSortedList<T extends object>(key: keyof UnwrapRef<T> | ((item: UnwrapRef<T>) => number), items: T[] = []): UnwrapRef<T>[] {
    const list = reactive(items) as UnwrapRef<T>[]

    const getter: (v: UnwrapRef<T>) => any = typeof key === 'function' ? key : (item: UnwrapRef<T>) => item[key]

    watchEffect(() => {
        list.sort((a, b) => {
            const aVal = getter(a)
            const bVal = getter(b)

            return aVal < bVal ? -1 : aVal > bVal ? 1 : 0
        })
    })

    return list
}
