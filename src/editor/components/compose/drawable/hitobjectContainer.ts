import {computed, ComputedRef, effectScope, onBeforeUnmount, ref, Ref, UnwrapRef, watch} from "vue";
import {Container, DisplayObject, Renderer, Transform} from "pixi.js";
import {EditorContext, useEditor} from "@/editor";
import {binarySearch} from "@/util/binarySearch";
import {useCurrentTime} from "@/editor/clock";
import {createDrawableHitObject} from "@/editor/components/compose/drawable/hitobject";
import {HitObject} from "@/editor/state/hitobject";
import {container} from "@/editor/components/compose/drawable/dsl";
import {createFollowPoints, FollowPointDrawable} from "@/editor/components/compose/drawable/followPoints";


function createHitObjects(currentTime: Readonly<Ref<number>>, editor: EditorContext, renderer: Renderer, transform: Transform, visibleHitObjects: ComputedRef<UnwrapRef<HitObject>[]>) {
    const container = new Container();
    const drawables = new Map<number, Container>()

    onBeforeUnmount(() => {
        container?.destroy({children: true})
    })

    function updateHitObjectsContainer(objects: HitObject[]) {
        const shouldRemove = new Set(drawables.keys())

        objects.forEach((object, index) => {

            let drawable = drawables.get(object.id)
            if (drawable) {
                shouldRemove.delete(object.id)
            } else {
                drawable = createDrawableHitObject(object, editor, renderer, transform)
                drawables.set(object.id, drawable)
                container.addChild(drawable)
            }
            drawable.zIndex = -index
        })

        shouldRemove.forEach(id => {
            const drawable = drawables.get(id)

            if (drawable) {
                drawables.delete(id)
                drawable.destroy({
                    children: true
                })
            }
        })

        container.sortChildren()
    }

    watch(visibleHitObjects, (objects) => {
        updateHitObjectsContainer(objects as HitObject[])
    })

    updateHitObjectsContainer(visibleHitObjects.value as HitObject[])

    return container;
}

function createFollowPointsContainer(currentTime: Readonly<Ref<number>>, editor: EditorContext, visibleHitObjects: ComputedRef<UnwrapRef<HitObject>[]>) {
    const container = new Container()

    const drawables = new Map<number, FollowPointDrawable>()
    onBeforeUnmount(() => {
        container?.destroy({children: true})
    })

    function updateFollowPointsContainer(objects: HitObject[]) {
        const shouldRemove = new Set(drawables.keys())

        for (let i = 0; i < objects.length - 1; i++) {
            const current = objects[i]
            const next = objects[i + 1]

            if (next.newCombo) {
                continue;
            }

            let drawable = drawables.get(current.id)
            if (drawable) {
                shouldRemove.delete(current.id)
                drawable.to.value = next
            } else {
                const scope = effectScope()

                drawable = scope.run(() => createFollowPoints(current, next, editor))!

                drawable.displayObject.once('destroyed', () => scope.stop())

                drawables.set(current.id, drawable)
                container.addChild(drawable.displayObject)
            }
        }

        shouldRemove.forEach(id => {
            const drawable = drawables.get(id)
            if (drawable) {
                drawables.delete(id)
                drawable.displayObject.destroy({
                    children: true
                })
            }
        })
    }

    watch(visibleHitObjects, (objects) => {
        updateFollowPointsContainer(objects as HitObject[])
    })

    return container
}

export function createPlayfieldObjectsContainer(renderer: Renderer, transform: Transform) {

    const {state} = useEditor()


    const currentTime = useCurrentTime()
    const editor = useEditor()

    const visibleHitObjects = state.hitObjects.visible

    const hitObjectsContainer = createHitObjects(currentTime, editor, renderer, transform, visibleHitObjects);
    const followPointsContainer = createFollowPointsContainer(currentTime, editor, visibleHitObjects)

    return container([
        followPointsContainer,
        hitObjectsContainer,
    ]).object
}
