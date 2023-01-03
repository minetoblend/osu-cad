import {HitCircle} from "@/editor/state/hitobject/circle";
import {useSkin} from "@/editor/skin";
import {animate, container, instantEasing, sprite} from "@/editor/components/compose/drawable/dsl";
import {Easing, Vector2} from "osu-classes";
import {add, multiply, subtract, ternary} from "@/util/reactiveMath";
import {useCurrentTime} from "@/editor/clock";
import {useGlobalConfig} from "@/use/useGlobalConfig";
import {computed, Ref, toRef, watchEffect} from "vue";
import {MaybeComputedRef} from "@vueuse/core";
import {useAnimationValues} from "@/editor/animation";
import {EditorContext} from "@/editor";
import {filters} from "pixi.js";

const stackDirection = new Vector2(-1, -1).normalize().scale(3)

export function createDrawableHitCircle(circle: HitCircle, editor: EditorContext) {
    const comboColor = 0xfcba03

    const animationTime = subtract(useCurrentTime(true, editor), toRef(circle, 'startTime'))

    const hitAnimationsEnabled = useGlobalConfig('hitAnimationsEnabled')

    const scale = computed(() => 0.5)

    const hitAnimationFadeoutTime = 200

    const stackedPosition = computed(() => circle.position.add(stackDirection.scale(circle.stackHeight)))

    return container([
        circlePieceDrawable(editor, animationTime, comboColor),
        approachCircleDrawable(editor, animationTime, comboColor),
    ])
        .pos(stackedPosition)
        .fadeOut(animationTime, ternary(hitAnimationsEnabled, hitAnimationFadeoutTime, 800))
        .scale(
            ternary(hitAnimationsEnabled, animate(animationTime,
                    {
                        time: 0,
                        value: scale,
                    },
                    {
                        time: hitAnimationFadeoutTime,
                        value: multiply(scale, 1.5),
                    }
                ),
                scale
            )
        ).object
}


export function circlePieceDrawable(editor: EditorContext, animationTime: Readonly<Ref<number>>, comboColor: number) {
    const skin = useSkin(editor)

    const {preemtNegative, fadeIn} = useAnimationValues()

    return container([
        sprite(skin.hitCircle)
            .center()
            .tint(animate(animationTime,
                {
                    time: preemtNegative,
                    value: comboColor,
                    easing: instantEasing
                },
                {
                    time: 0,
                    value: 0xffffff
                }
            )),
        sprite(skin.hitCircleOverlay)
            .center(),
    ])
        .fade(animate(animationTime,
            {
                time: preemtNegative,
                value: 0,
            },
            {
                time: add(preemtNegative, fadeIn),
                value: 1,
            }
        ))
}

export function approachCircleDrawable(editor: EditorContext, animationTime: Readonly<Ref<number>>, tint: MaybeComputedRef<number>) {
    const skin = useSkin(editor)
    const {preemtNegative, preemt} = useAnimationValues()

    const approachCircle = sprite(skin.approachCircle)
        .center()
        .scale(
            animate(animationTime, {
                time: preemtNegative,
                value: 4
            }, {
                time: 0,
                value: 1,
                easing: Easing.outQuad
            }, {
                time: 200,
                value: 1.06
            }),
        )
        .fadeIn(animationTime, preemt)
        .tint(tint);

    const blurFilter = new filters.BlurFilter(10)

    const blurAmount = animate(animationTime,
        {time: preemtNegative, value: 5, easing: Easing.outQuad},
        {time: 0, value: 0},
    )

    watchEffect(() => {
        blurFilter.blur = blurAmount.value
    })

    approachCircle.object.filters = [
        blurFilter,
    ]

    return approachCircle
}
