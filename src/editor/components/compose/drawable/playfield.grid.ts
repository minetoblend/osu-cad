import {Graphics, Point, Transform} from "pixi.js";
import {useMagicKeys, whenever} from "@vueuse/core";
import {Ref, ref, toRaw, UnwrapRef, watch, watchEffect} from "vue";
import {useEditor} from "@/editor";
import {SimpleTransform} from "@/editor/components/compose/drawable/container";
import {useGlobalConfig} from "@/use/useGlobalConfig";
import {useShortcut} from "@/editor/shortcuts/shortcuts";

export function createPlayfieldGrid(transform: Transform) {
    const grid = new Graphics();
    grid.alpha = 0.5

    const gridSize = useGlobalConfig('gridSize')

    whenever(useShortcut('grid.tiny'), () => gridSize.value = 'tiny')
    whenever(useShortcut('grid.small'), () => gridSize.value = 'small')
    whenever(useShortcut('grid.medium'), () => gridSize.value = 'medium')
    whenever(useShortcut('grid.large'), () => gridSize.value = 'large')

    function drawGrid() {
        grid.clear()


        const t = toRaw(transform)

        const increments = {
            tiny: 4,
            small: 8,
            medium: 16,
            large: 32
        }

        let increment = increments[gridSize.value] * t.scale.x

        grid.lineStyle({
            native: true,
            width: 1,
            color: 0xffffff,
            alignment: 0,
            alpha: 0.5,
        })

        for (let x = increment; x < 512 * t.scale.x; x += increment) {
            grid.moveTo(Math.round(t.position.x + x), Math.round(t.position.y))
            grid.lineTo(Math.round(t.position.x + x), Math.round(t.position.y + 384 * t.scale.y))
        }

        for (let y = increment; y < 384 * t.scale.y; y += increment) {
            grid.moveTo(Math.round(t.position.x), Math.round(t.position.y + y))
            grid.lineTo(Math.round(t.position.x + 512 * t.scale.x), Math.round(t.position.y + y))
        }

        grid.lineStyle({
            width: 2,
            color: 0xffffff,
            alignment: 0.5,
            alpha: 0.5
        })

        grid.moveTo(Math.round(t.position.x + 256 * t.scale.x), Math.round(t.position.y))
        grid.lineTo(Math.round(t.position.x + 256 * t.scale.x), Math.round(t.position.y + 384 * t.scale.y))

        grid.moveTo(Math.round(t.position.x), Math.round(t.position.y + 192 * t.scale.y))
        grid.lineTo(Math.round(t.position.x + 512 * t.scale.x), Math.round(t.position.y + 192 * t.scale.y))

    }

    watch([transform, gridSize], () => {
        drawGrid()
    }, {deep: true})

    drawGrid()

    return grid
}

