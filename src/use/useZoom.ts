import {reactive, Ref} from "vue";
import {IPointData, Transform} from "pixi.js";
import {useDraggable, useEventListener} from "@vueuse/core";
import {usePlatform} from "@/util/platform";


export function useZoom(el: Ref<HTMLElement | undefined>) {
    const transform = reactive(new Transform())

    const {isWeb} = usePlatform()

    if (isWeb) {

        useEventListener(el, 'wheel', (e: WheelEvent) => {

            if (!e.ctrlKey)
                return

            e.preventDefault()

            const rect = el.value!.getBoundingClientRect()

            const x = e.clientX - rect.left
            const y = e.clientY - rect.top

            const oldScale = transform.scale.x
            let newScale = (oldScale * (1 - e.deltaY / 1000))
            if (newScale < 1)
                newScale = 1
            if (newScale > 5)
                newScale = 5

            const s = newScale / oldScale

            const matrix = transform.localTransform

            matrix.translate(-x, -y)
            matrix.scale(s, s)
            matrix.translate(x, y)

            transform.setFromMatrix(matrix)

            transform.updateLocalTransform()
            clampTransform(rect)
        })

        function clampTransform(rect: DOMRect) {
            if (transform.scale.x < 1)
                transform.scale.set(1)
            if (transform.scale.x > 5)
                transform.scale.set(5)

            if (transform.position.x > 0)
                transform.position.x = 0
            if (transform.position.x < -rect.width * (transform.scale.x - 1))
                transform.position.x = -rect.width * (transform.scale.x - 1)
            if (transform.position.y > 0)
                transform.position.y = 0
            if (transform.position.y < -rect.height * (transform.scale.y - 1))
                transform.position.y = -rect.height * (transform.scale.y - 1)

            transform.updateLocalTransform()
        }

        let offset: IPointData

        useDraggable(el, {
            initialValue: () => transform.position,
            onMove: (position, evt) => {
                transform.position.x += evt.movementX
                transform.position.y += evt.movementY

                clampTransform(el.value!.getBoundingClientRect())
            }
        })

    } else {
        
    }


    return {
        transform,
    }
}
