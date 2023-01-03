import {computed, readonly, ref} from "vue";
import {EditorContext, useEditor} from "@/editor/index";

import gsap from "gsap";
import {useRafFn} from "@vueuse/core";

export function createClock() {
    const currentTime = ref(10_000)
    const animatedTime = ref(10_000)

    let tween: gsap.core.Tween | null = null

    const playing = ref(false)

    function seek(time: number, animated = true) {

        if (playing.value)
            animated = false

        currentTime.value = time
        if (tween)
            tween.kill()

        if (animated) {
            tween = gsap.to(animatedTime, {
                duration: 0.15,
                value: time
            })
        } else {
            animatedTime.value = time
            tween = null
        }
    }

    let lastTime = performance.now()

    useRafFn(() => {
        const now = performance.now()
        const dt = now - lastTime
        lastTime = now

        if (playing.value)
            seek(currentTime.value + dt, false)

    })

    return {
        currentTime: computed({
            get: () => currentTime.value,
            set: (value) => {
                seek(value, true)
            }
        }),
        animatedTime: readonly(animatedTime),
        seek,
        playing,
    }

}

export type EditorClock = ReturnType<typeof createClock>

export function useClock(editor: EditorContext = useEditor()) {
    return editor.clock
}

export function useCurrentTime(animated = false, editor: EditorContext = useEditor()) {

    if (animated) {
        return useClock(editor).animatedTime
    }

    return useClock(editor).currentTime
}
