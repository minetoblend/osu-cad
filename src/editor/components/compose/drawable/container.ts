import {MaybeComputedRef, MaybeRef, reactiveComputed} from "@vueuse/core";
import {Container, Matrix, Transform} from "pixi.js";
import {computed, reactive, readonly, ref, unref, watchEffect} from "vue";

export function roundToPixels(value: number, pixels: number) {
    return Math.round(value * pixels) / pixels
}

export function fixedResolutionContainer(opts: FixedResolutionContainerOptions) {

    const matrix = computed(() => {

        const scale = Math.min(
            roundToPixels(unref(opts.actualWidth) / unref(opts.width) * unref(opts.scale ?? 1), unref(opts.actualWidth)),
            roundToPixels(unref(opts.actualHeight) / unref(opts.height) * unref(opts.scale ?? 1), unref(opts.actualHeight))
        )


        const offsetX = Math.round((unref(opts.actualWidth) - unref(opts.width) * scale) / 2)
        const offsetY = Math.round((unref(opts.actualHeight) - unref(opts.height) * scale) / 2)

        return Matrix.IDENTITY
            .scale(scale, scale)
            .translate(offsetX, offsetY)
    })

    return {
        matrix,
    };
}

export interface SimpleTransform {
    scale: number
    offsetX: number
    offsetY: number
}

interface FixedResolutionContainerOptions {
    width: MaybeRef<number>;
    height: MaybeRef<number>;
    actualWidth: MaybeRef<number>;
    actualHeight: MaybeRef<number>;
    scale?: MaybeRef<number>;
}
