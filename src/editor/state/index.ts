import {HitObject} from "@/editor/state/hitobject";
import {computed, reactive, readonly, ref, watch, watchEffect, WatchStopHandle} from "vue";
import {createHitSoundState} from "@/editor/hitsounds";
import {binarySearch} from "@/util/binarySearch";
import {EditorClock} from "@/editor/clock";
import {History} from "@/editor/transaction/history";
import {createTiming, Timing} from "@/editor/state/timing";
import {transactional} from "@/editor/transaction/transactional";
import {Subject} from "rxjs";
import {createStackManager} from "@/editor/state/stacking";


export function createEditorState(clock: EditorClock, history: History) {
    const background = ref('/bg.jpg')

    const hitSounds = createHitSoundState()

    const timing = createTiming()

    const hitObjects = createHitObjectState(clock, timing)

    createStackManager(hitObjects.all)

    return {
        hitObjects: transactional(hitObjects, history),
        timing: transactional(timing, history),
        background,
        hitSounds,
    }
}

export function createHitObjectState(clock: EditorClock, timing: Timing) {
    const hitObjects = reactive<HitObject[]>([])

    const onAdded$ = new Subject<HitObject>()
    const onRemoved$ = new Subject<HitObject>()

    const visible = computed(() => {

        let {index: start} = binarySearch(hitObjects, (hitObject) => hitObject.endTime, clock.animatedTime.value - 2000)
        let {index: end} = binarySearch(hitObjects, (hitObject) => hitObject.startTime, clock.animatedTime.value + 2000)

        start = Math.max(start - 2, 0)
        end = Math.min(end + 1, hitObjects.length)

        return hitObjects.slice(start, end)
    })

    watchEffect(() => hitObjects
        .sort((a, b) => a.startTime - b.startTime)
    )

    const watchStopHandles = new Map<HitObject, WatchStopHandle[]>()

    function addHitObject(hitObject: HitObject) {
        hitObjects.push(hitObject)

        const stopHandles: WatchStopHandle[] = [
            watchEffect(() => {
                hitObject.applyDefaults(timing)
            })
        ]

        watchStopHandles.set(hitObject, stopHandles)
    }

    function removeHitObject(hitObject: HitObject) {
        const index = hitObjects.indexOf(hitObject)
        if (index === -1) return

        hitObjects.splice(index, 1)

        const stopHandles = watchStopHandles.get(hitObject)
        if (stopHandles) {
            for (const stopHandle of stopHandles) {
                stopHandle()
            }
        }
    }

    return {
        all: hitObjects,
        visible,
        addHitObject,
        removeHitObject,

        onAdded$: onAdded$.asObservable(),
        onRemoved$: onRemoved$.asObservable(),
    }
}

export type EditorState = ReturnType<typeof createEditorState>
