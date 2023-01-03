import {Container, DisplayObject, IPointData, ObservablePoint, Sprite, Texture} from "pixi.js";
import {MaybeComputedRef, MaybeRef, resolveUnref} from "@vueuse/core";
import {computed, ComputedRef, getCurrentScope, onScopeDispose, Ref, ref, unref, watchEffect} from "vue";
import {Easing} from "osu-classes";
import {lerp} from "@/util/math";
import {negative} from "@/util/reactiveMath";

export function sprite(texture: Texture): SpriteBuilder {
    return new SpriteBuilder(texture);
}

export function container(children: (DisplayObject | DisplayObjectBuilder<any>)[]) {
    const container = new Container()

    for (const child of children) {
        if (child instanceof DisplayObjectBuilder) {
            container.addChild(child.object)
        } else {
            container.addChild(child)
        }
    }

    return new DisplayObjectBuilder(container)
}

export class DisplayObjectBuilder<T extends DisplayObject> {
    object: T

    constructor(object: T) {
        this.object = object;
    }

    pos(pos: MaybeComputedRef<IPointData>) {
        const stop = watchEffect(() => this.object.position.copyFrom(resolveUnref(pos)))

        this.object.once('destroyed', stop)

        if (getCurrentScope() === undefined) {
            console.trace()
        }

        return this
    }

    scale(scale: MaybeComputedRef<number>) {
        const stop = watchEffect(() => this.object.scale.set(resolveUnref(scale)))

        this.object.once('destroyed', stop)

        return this
    }

    fade(alpha: MaybeComputedRef<number>) {
        const stop = watchEffect(() => this.object.alpha = resolveUnref(alpha))

        this.object.once('destroyed', stop)

        return this
    }

    fadeOut(currentTime: Readonly<Ref<number>>, duration: MaybeComputedRef<number>) {
        return this.fade(animate(currentTime, {
                time: 0,
                value: 1,
            }, {
                time: duration,
                value: 0,
            })
        )
    }

    fadeIn(currentTime: Readonly<Ref<number>>, duration: MaybeComputedRef<number>) {
        return this.fade(animate(currentTime, {
                time: negative(duration),
                value: 0,
            }, {
                time: 0,
                value: 1,
            })
        )
    }

    visible(visible: MaybeComputedRef<boolean>) {
        const stop = watchEffect(() => this.object.visible = resolveUnref(visible))

        this.object.once('destroyed', stop)

        return this
    }

    rotate(angle: MaybeComputedRef<number>) {
        const stop = watchEffect(() => this.object.rotation = resolveUnref(angle))

        this.object.once('destroyed', stop)

        return this
    }
}

export class SpriteBuilder extends DisplayObjectBuilder<Sprite> {
    constructor(readonly texture: Texture) {
        super(new Sprite(texture))
    }

    center() {
        this.object.anchor.set(0.5, 0.5)
        return this
    }

    tint(tint: MaybeComputedRef<number>) {
        const stop = watchEffect(() => this.object.tint = resolveUnref(tint))

        this.object.once('destroyed', stop)

        return this
    }

}

export function animate(currentTime: Readonly<Ref<number>>, ...keyframes: Keyframe[]) {

    if (keyframes.length === 0) {
        throw new Error("Timeline must have at least one keyframe")
    }

    function getKeyframeIndex(time: number) {
        let index = 0
        let left = 0;
        let right = keyframes.length - 1;
        while (left <= right) {
            index = left + ((right - left) >> 1);
            let commandTime = resolveUnref(keyframes[index].time);
            if (commandTime == time)
                return {found: true, index};
            else if (commandTime < time)
                left = index + 1;
            else right = index - 1;
        }
        index = left;
        return {found: false, index};
    }

    return computed(() => {
        let {index, found} = getKeyframeIndex(currentTime.value)

        if (!found && index > 0)
            index--;

        const keyframe = keyframes[index]
        const easingFunction = keyframe.easing ?? Easing.linear

        if (index + 1 < keyframes.length) {
            const nextKeyframe = keyframes[index + 1]
            const duration = resolveUnref(nextKeyframe.time) - resolveUnref(keyframe.time)
            const progress = easingFunction((currentTime.value - resolveUnref(keyframe.time)) / duration)
            return lerp(resolveUnref(keyframe.value), resolveUnref(nextKeyframe.value), progress)
        }

        return resolveUnref(keyframe.value)
    })
}

export function animateIf(enabled: MaybeComputedRef<boolean>, defaultValue: MaybeComputedRef<number>, currentTime: Readonly<Ref<number>>, ...keyframes: Keyframe[]) {
    return computed(() => {
        if (resolveUnref(enabled))
            return animate(currentTime, ...keyframes).value
        return resolveUnref(defaultValue)
    })
}

export interface Keyframe {
    time: MaybeComputedRef<number>
    value: MaybeComputedRef<number>
    easing?: Easing.EasingFn
}

export const instantEasing: Easing.EasingFn = (t) => t < 1 ? 0 : 1
