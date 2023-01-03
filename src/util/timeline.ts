import {lerp} from "@/util/math";

interface Keyframe {
    time: number
    value: any
    easing?: EasingFunction
}

type EasingFunction = (t: number) => number

const defaultEasingFunction = (t: number) => t

export class Timeline {

    readonly keyframes = [] as Keyframe[]

    constructor(readonly defaultValue = 0) {
    }

    getKeyframeAt(time: number): Keyframe {
        let {index, found} = this.getKeyframeIndex(time)
        if (!found && index > 0)
            index--;
        return this.keyframes[index]
    }

    addKeyframe(keyframe: Keyframe): Timeline
    addKeyframe(time: number, value: any, easing?: EasingFunction): Timeline

    addKeyframe(keyframe: Keyframe | number, value?: any, easing?: EasingFunction) {
        if (typeof keyframe === 'number')
            keyframe = {time: keyframe, value, easing}

        this.keyframes.splice(this.getKeyframeIndex(keyframe.time).index, 0, keyframe)

        return this
    }

    getValueAt(time: number) {
        if (this.keyframes.length === 0)
            return this.defaultValue

        let {index, found} = this.getKeyframeIndex(time)

        if (!found && index > 0)
            index--;

        const keyframe = this.keyframes[index]
        const easingFunction = keyframe.easing ?? defaultEasingFunction

        if (index + 1 < this.keyframes.length) {
            const nextKeyframe = this.keyframes[index + 1]
            const duration = nextKeyframe.time - keyframe.time
            const progress = easingFunction((time - keyframe.time) / duration)
            return lerp(keyframe.value, nextKeyframe.value, progress)
        }

        return keyframe.value
    }


    private getKeyframeIndex(time: number): { found: boolean, index: number } {
        let index = 0
        let left = 0;
        let right = this.keyframes.length - 1;
        while (left <= right) {
            index = left + ((right - left) >> 1);
            let commandTime = this.keyframes[index].time;
            if (commandTime == time)
                return {found: true, index};
            else if (commandTime < time)
                left = index + 1;
            else right = index - 1;
        }
        index = left;
        return {found: false, index};
    }
}
