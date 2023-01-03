import {reactive} from "vue";

export function metadata() {
    const state = reactive({
        artist: '',
    })

    const localOverrides = reactive({})

    let messageId = 0;

    const keys = [
        'artist',
    ] as Array<keyof typeof state>

    let adapter: any = null;

    function hydrate(data: any) {
        for (const key of keys) {
            state[key] = data[key]
        }
    }

    function attach(a: any) {
        adapter = a
    }

    return new Proxy(state, {
        get: (target, p) => {
            if (p === 'hydrate')
                return hydrate

            return Reflect.get(target, p)
        },
        set: (target, p, newValue, receiver) => {
            if (keys.includes(p as any)) {
                adapter?.sendUpdate({
                    path: ['metadata', p],
                    value: newValue,
                })
                return Reflect.set(localOverrides, p, newValue, receiver)
            }
            return false
        }
    }) as typeof state & {
        hydrate: (data: any) => void
        attach: (adapter: any) => void
    }
}
