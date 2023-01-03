import {ref, watchEffect, WatchStopHandle} from "vue";
import {isSlider, Slider} from "@/editor/state/hitobject/slider";
import {HitObject} from "@/editor/state/hitobject";
import {isHitCircle} from "@/editor/state/hitobject/circle";
import {useAnimationValues} from "@/editor/animation";


const STACK_DISTANCE = 3

export function createStackManager(hitObjects: Readonly<HitObject[]>) {
    const stackLeniency = ref(5)

    const {preemt} = useAnimationValues()

    watchEffect(() => {
        applyStacking(hitObjects, stackLeniency.value, preemt.value)
    }, {flush: 'post'})

    return {}
}

function applyStacking(hitObjects: Readonly<HitObject[]>, stackLeniency: number, timePreempt: number) {
    const stackDistance = STACK_DISTANCE;

    const startIndex = 0;
    const endIndex = hitObjects.length - 1;

    let extendedEndIndex = endIndex;

    if (endIndex < hitObjects.length - 1) {
        // Extend the end index to include objects they are stacked on
        for (let i = endIndex; i >= startIndex; --i) {
            let stackBaseIndex = i;

            for (let n = stackBaseIndex + 1; n < hitObjects.length; ++n) {
                const stackBaseObject = hitObjects[stackBaseIndex];

                // TODO
                // if (stackBaseObject instanceof Spinner) break;

                const objectN = hitObjects[n];

                // TODO
                //if (objectN instanceof Spinner) continue;

                const endTime = (stackBaseObject as Slider).endTime || stackBaseObject.startTime;

                const stackThreshold = timePreempt * stackLeniency;

                if (objectN.startTime - endTime > stackThreshold) {
                    // We are no longer within stacking range of the next object.
                    break;
                }

                const distance1 = stackBaseObject.position.fdistance(objectN.position) < stackDistance;
                const distance2 = isSlider(stackBaseObject)
                    && stackBaseObject.endPosition.fdistance(objectN.position) < stackDistance;

                if (distance1 || distance2) {
                    stackBaseIndex = n;

                    // HitObjects after the specified update range haven't been reset yet
                    objectN.stackHeight = 0;
                }
            }

            if (stackBaseIndex > extendedEndIndex) {
                extendedEndIndex = stackBaseIndex;

                if (extendedEndIndex === hitObjects.length - 1) {
                    break;
                }
            }
        }
    }

    // Reverse pass for stack calculation.
    let extendedStartIndex = startIndex;

    for (let i = extendedEndIndex; i > startIndex; --i) {
        /**
         * We should check every note which has not yet got a stack.
         * Consider the case we have two interwound stacks and this will make sense.
         *
         * o <-1      o <-2
         *  o <-3      o <-4
         *
         * We first process starting } from 4 and handle 2,
         * then we come backwards on the i loop iteration until we reach 3 and handle 1.
         * 2 and 1 will be ignored in the i loop because they already have a stack value.
         */
        let n = i;

        let objectI = hitObjects[i];

        if (objectI.stackHeight !== 0 /*|| (objectI instanceof Spinner)*/) {
            continue;
        }

        const stackThreshold = timePreempt * stackLeniency;

        /**
         * If this object is a circle, then we enter this "special" case.
         * It either ends with a stack of circles only, or a stack of circles that are underneath a slider.
         * Any other case is handled by the "instanceof Slider" code below this.
         */
        if (isHitCircle(objectI)) {
            while (--n >= 0) {
                const objectN = hitObjects[n];

                // if (objectN instanceof Spinner) continue;

                const endTime = (objectN as Slider).endTime || objectN.startTime;

                if (objectI.startTime - endTime > stackThreshold) {
                    // We are no longer within stacking range of the previous object.
                    break;
                }

                // HitObjects before the specified update range haven't been reset yet
                if (n < extendedStartIndex) {
                    objectN.stackHeight = 0;
                    extendedStartIndex = n;
                }

                /**
                 * This is a special case where hticircles are moved DOWN and RIGHT (negative stacking)
                 * if they are under the *last* slider in a stacked pattern.
                 *      o==o <- slider is at original location
                 *       o <- hitCircle has stack of -1
                 *        o <- hitCircle has stack of -2
                 */
                const distanceNI = objectN.endPosition.fdistance(objectI.position);

                if (isSlider(objectN) && distanceNI < stackDistance) {
                    const offset = objectI.stackHeight - objectN.stackHeight + 1;

                    for (let j = n + 1; j <= i; ++j) {
                        /**
                         * For each object which was declared under this slider,
                         * we will offset it to appear *below* the slider end (rather than above).
                         */
                        const objectJ = hitObjects[j];
                        const distanceNJ = objectN.endPosition.fdistance(objectJ.position);

                        if (distanceNJ < stackDistance) {
                            objectJ.stackHeight -= offset;
                        }
                    }

                    /**
                     * We have hit a slider.  We should restart calculation using this as the new base.
                     * Breaking here will mean that the slider still has StackCount of 0, so will be handled in the i-outer-loop.
                     */
                    break;
                }

                if (objectN.position.fdistance(objectI.position) < stackDistance) {
                    /**
                     * Keep processing as if there are no sliders.  If we come across a slider, this gets cancelled out.
                     * NOTE: Sliders with start startPositions stacking are a special case that is also handled here.
                     */

                    objectN.stackHeight = objectI.stackHeight + 1;
                    objectI = objectN;
                }
            }
        } else if (isSlider(objectI)) {
            /**
             * We have hit the first slider in a possible stack.
             * } from this point on, we ALWAYS stack positive regardless.
             */
            while (--n >= startIndex) {
                const objectN = hitObjects[n];

                // if (objectN instanceof Spinner) continue;

                if (objectI.startTime - objectN.startTime > stackThreshold) {
                    // We are no longer within stacking range of the previous object.
                    break;
                }

                const distance = objectN.endPosition.fdistance(objectI.position);

                if (distance < stackDistance) {
                    objectN.stackHeight = objectI.stackHeight + 1;
                    objectI = objectN;
                }
            }
        }
    }
}
