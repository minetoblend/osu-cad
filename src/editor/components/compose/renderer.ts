import {createGlobalState, useElementSize, useRafFn} from "@vueuse/core";
import {Container, Renderer} from 'pixi.js';
import {Ref, watchEffect} from "vue";

const useContext = createGlobalState(() => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('webgl2', {
        desynchronized: true,
        antialias: true,
        powerPreference: 'high-performance',
        depth: true,
        stencil: true,
        premultipliedAlpha: true,
    })!;

    return {
        context, canvas
    }
})

export function usePixi(container: Ref<HTMLElement | undefined>) {
    const {context, canvas} = useContext()

    const {width, height} = useElementSize(container, {width: 0, height: 0}, {
        // box: 'device-pixel-content-box'
    });

    const stage = new Container();


    console.log(devicePixelRatio)

    let renderer = new Renderer({
        context,
        view: canvas,
        backgroundColor: 0x000000,
        autoDensity: true,
        resolution: devicePixelRatio,

    })

    watchEffect(() => {
        if (container.value)
            container.value.appendChild(canvas);
        else
            canvas.remove()
    })

    watchEffect(() => {
        console.log('resize', width, height)

        renderer.resize(width.value, height.value);
    })

    useRafFn(() => {
        renderer.render(stage, {})
    })

    return {
        stage,
        renderer,
        width,
        height
    }
}
