import {computed, reactive, readonly, ref, UnwrapRef} from "vue";
import {uniqueId} from "@/util/id";
import {Vector2} from "osu-classes";
import {TimingPoint} from "@/editor/state/timingPoint";
import {Timing} from "@/editor/state/timing";


export function defineHitObject<Type extends string, Setup extends object>(type: Type, setup: (base: HitObjectBase<Type>) => Setup): () => HitObject<Type, Setup> {
    return () => {

        const hitObject = createHitObjectBase(type)

        const extension = setup(hitObject)
        for (const key in extension) {
            if (extension.hasOwnProperty(key)) {
                Reflect.set(hitObject, key, extension[key])
            }
        }

        return reactive(hitObject) as unknown as HitObject<Type, Setup>
    }
}

function createHitObjectBase<Type extends string>(type: Type) {
    const startTime = ref(0)
    const endTime = startTime
    const duration = computed(() => endTime.value - startTime.value)

    const position = ref(new Vector2(0, 0))
    const endPosition = position

    const selected = ref(false)

    const timingPoint = ref<TimingPoint>()

    function applyDefaults(timing: Timing) {
    }

    const stackHeight = ref(0)

    return {
        id: ref(uniqueId()),
        position,
        endPosition,
        startTime,
        endTime,
        duration,
        selected,
        timingPoint,
        newCombo: ref(false),
        type: readonly(ref(type)),
        stackHeight,
        applyDefaults,
    }
}

export type HitObject<Type extends string = any, Setup extends object = {}> =
    UnwrapRef<HitObjectBase<Type>>
    & UnwrapRef<Setup>

type HitObjectBase<Type extends string> = ReturnType<typeof createHitObjectBase>
