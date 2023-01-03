import {HitObject} from "@/editor/state/hitobject";
import {computed, shallowRef, toRef, watchEffect} from "vue";
import {Container, Sprite} from "pixi.js";
import {EditorContext} from "@/editor";
import {animate, sprite} from "@/editor/components/compose/drawable/dsl";
import {add, subtract} from "@/util/reactiveMath";
import {Easing} from "osu-classes";


export function createFollowPoints(first: HitObject, second: HitObject, editor: EditorContext) {

    const start = shallowRef(first)
    const end = shallowRef(second)

    const container = new Container()

    container.once('destroyed', watchEffect(() => {
        container.removeChildren().forEach(it => it.destroy())

        const startPos = start.value.endPosition
        const endPos = end.value.position

        const delta = endPos.subtract(startPos)

        const animationTime = subtract(editor.clock.animatedTime, toRef(start.value, 'startTime'))


        const padding = 32
        const gap = 32
        const angle = Math.atan2(delta.y, delta.x)

        const amount = Math.round((delta.length() - padding * 2) / gap)

        const duration = computed(() => end.value.startTime - start.value.startTime)

        for (let i = 0; i < amount; i++) {

            const offset = computed(() => duration.value * i / amount)

            const distance =
                add(() => padding + i * gap, animate(animationTime, {
                        time: add(-600, offset),
                        value: -10,
                        easing: Easing.outQuad

                    },
                    {
                        time: add(-400, offset),
                        value: 0,
                    }
                ))

            computed(() => padding + i * gap)

            container.addChild(
                sprite(editor.skin.followPoint)
                    .center()
                    .scale(0.5)
                    .rotate(angle)

                    .fade(animate(animationTime,
                        {
                            time: add(-600, offset),
                            value: 0
                        },
                        {
                            time: add(-400, offset),
                            value: 1
                        },
                        {
                            time: offset,
                            value: 1
                        },
                        {
                            time: add(400, offset),
                            value: 0
                        }
                    ))
                    .pos(computed(() => startPos.add(delta.normalize().scale(distance.value))))
                    .object
            )
        }

    }))

    return {
        from: start,
        to: end,
        displayObject: container
    }
}

export type FollowPointDrawable = ReturnType<typeof createFollowPoints>
