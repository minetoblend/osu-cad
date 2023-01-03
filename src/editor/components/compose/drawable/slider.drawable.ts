import {EditorContext} from "@/editor";
import {animate, container, sprite} from "@/editor/components/compose/drawable/dsl";
import {Slider} from "@/editor/state/hitobject/slider";
import {add, multiply, subtract} from "@/util/reactiveMath";
import {useCurrentTime} from "@/editor/clock";
import {computed, ref, Ref, toRef, watch, watchEffect} from "vue";
import {
    BaseTexture,
    BLEND_MODES, Bounds,
    DRAW_MODES, filters,
    Geometry, Graphics, Matrix,
    Mesh,
    MSAA_QUALITY, Renderer,
    RenderTexture,
    Sprite,
    Texture, Transform
} from "pixi.js";
import {SliderTextureResource} from "@/editor/components/compose/drawable/sliderTextureResource";
import {SliderMaterial} from "@/editor/components/compose/drawable/sliderMaterial";
import {createSliderGeometry} from "@/editor/components/compose/drawable/sliderGeometry";
import {approachCircleDrawable, circlePieceDrawable} from "@/editor/components/compose/drawable/hitcircle.drawable";
import {useAnimationValues} from "@/editor/animation";
import {Vector2} from "osu-classes";

const stackDirection = new Vector2(-1, -1).normalize().scale(3)


export function createDrawableSlider(slider: Slider, editor: EditorContext, renderer: Renderer, viewportTransform: Transform) {
    const comboColor = 0xfcba03
    const skin = editor.skin
    const animationTime = subtract(useCurrentTime(true, editor), toRef(slider, 'startTime'))
    const sliderEndAnimationTime = subtract(useCurrentTime(true, editor), toRef(slider, 'endTime'))

    const scale = computed(() => 0.5)

    const {preemtNegative, fadeIn} = useAnimationValues()

    const stackedPosition = computed(() => slider.position.add(stackDirection.scale(slider.stackHeight)))

    return container([
        sliderBody(slider, editor, animationTime, renderer, viewportTransform)
            .fade(animate(animationTime,
                {
                    time: preemtNegative,
                    value: 0,
                },
                {
                    time: add(preemtNegative, fadeIn),
                    value: 1,
                },
                {
                    time: computed(() => slider.duration),
                    value: 1,
                },
                {
                    time: computed(() => slider.duration + 400),
                    value: 0,
                }
            )),
        container([
            circlePieceDrawable(editor, animationTime, comboColor),
            approachCircleDrawable(editor, animationTime, comboColor),
        ])
            .scale(scale)
            .fadeOut(animationTime, 800),

        container([
            circlePieceDrawable(editor, sliderEndAnimationTime, comboColor),
        ])
            .pos(() => slider.endPosition.subtract(slider.position))
            .fadeOut(sliderEndAnimationTime, 800)
            .scale(scale),

        sliderBall(slider, editor, animationTime),
    ])
        .pos(stackedPosition)
        .object
}

function controlPoints(slider: Slider) {
    const g = new Graphics()

    watchEffect(() => {
        g.clear()

        g.lineStyle(2, 0xffffff)
        g.moveTo(0, 0)
        for (let i = 1; i < slider.controlPoints.length; i++) {
            const current = slider.controlPoints[i]
            g.lineTo(current.position.x, current.position.y)
        }

        slider.controlPoints.forEach(controlPoint => {
            g.beginFill(0xffffff)
            g.drawCircle(controlPoint.position.x, controlPoint.position.y, 3)
            g.endFill()
        })
    })

    return g
}

export function sliderBall(slider: Slider, editor: EditorContext, animationTime: Readonly<Ref<number>>) {
    const progress = computed(() => {
        const t = animationTime.value
        return Math.min(t / slider.duration, 1)
    })

    return sprite(editor.skin.sliderb)
        .center()
        .scale(0.5)
        .pos(() => slider.path.getProgress(progress.value))
        .visible(() => animationTime.value >= 0 && animationTime.value < slider.duration)
}

export function sliderBody(slider: Slider, editor: EditorContext, animationTime: Readonly<Ref<number>>, renderer: Renderer, viewportTransform: Transform) {
    const renderTexture = RenderTexture.create({width: 1, height: 1})
    renderTexture.framebuffer.addDepthTexture()
    renderTexture.framebuffer.enableDepth()
    renderTexture.framebuffer.multisample = MSAA_QUALITY.HIGH

    const textureResource = new SliderTextureResource()
    const texture = new BaseTexture(textureResource)

    const geometry = new Geometry()
    geometry.addAttribute('aVertexPosition', [])
    geometry.addIndex([]);

    const material = new SliderMaterial(new Texture(texture))

    const mesh = new Mesh(geometry, material, undefined, DRAW_MODES.TRIANGLES)
    mesh.state.blendMode = BLEND_MODES.NONE

    const sliderBodySprite = new Sprite(renderTexture)

    const radius = 30 / 0.75
    const padding = 10

    const scale = computed(() => viewportTransform.scale.x)

    function updateTexture() {

        const bounds = new Bounds()

        bounds.addBounds(slider.path.bounds)

        bounds.minX = Math.max(bounds.minX, -1000)
        bounds.minY = Math.max(bounds.minY, -1000)
        bounds.maxX = Math.min(bounds.maxX, 512 + 1000)
        bounds.maxY = Math.min(bounds.maxY, 384 + 1000)

        bounds.pad(radius)

        let textureWidth = (bounds.maxX - bounds.minX) * scale.value + padding * 2
        let textureHeight = (bounds.maxY - bounds.minY) * scale.value + padding * 2

        if (textureWidth <= 0 || textureHeight <= 0 || isNaN(textureWidth) || isNaN(textureHeight)) {
            sliderBodySprite.visible = false
            return
        }

        // textureWidth = Math.pow(2, Math.ceil(Math.log2(textureWidth)))
        // textureHeight = Math.pow(2, Math.ceil(Math.log2(textureHeight)))

        // console.log(textureWidth, textureHeight)

        if (renderTexture.width !== textureWidth || renderTexture.height !== textureHeight) {
            renderTexture.resize(textureWidth, textureHeight)
        }


        const transform = new Matrix()
            .translate(-bounds.minX, -bounds.minY)
            .scale(scale.value, scale.value)
            .translate(padding, padding)


        renderer.gl.enable(renderer.gl.DEPTH_TEST)
        renderer.render(mesh, {
            renderTexture,
            clear: true,
            transform,
        })
        renderer.gl.disable(renderer.gl.DEPTH_TEST)

        sliderBodySprite.position.set(-padding / scale.value + bounds.minX, -padding / scale.value + bounds.minY)
        sliderBodySprite.scale.set(1 / scale.value)
        sliderBodySprite.visible = true
    }


    const {preemtNegative, fadeInNegative} = useAnimationValues()

    const snakeIn = animate(animationTime,
        {
            time: preemtNegative,
            value: 0,
        },
        {
            time: fadeInNegative,
            value: 1
        }
    )

    const path = computed(() => slider.path.getRange(0, snakeIn.value))


    function updateGeometry() {
        const result = createSliderGeometry(path.value, radius)


        geometry.indexBuffer.update(new Uint16Array(result.indices))
        geometry.getBuffer('aVertexPosition').update(new Float32Array(result.vertices.flat()))

        updateTexture()
    }

    const stopWatch = watch(path, () => {
        updateGeometry()
    })

    sliderBodySprite.once('destroyed', () => {
        stopWatch()
        renderTexture.destroy()
        texture.destroy()
        geometry.destroy()
        material.destroy()
        mesh.destroy()
    })


    sliderBodySprite.once('destroyed', watch(viewportTransform, () => updateTexture(), {deep: true}))

    updateGeometry()

    sliderBodySprite.filters = [
        //     new filters.FXAAFilter(),
        //     new DropShadowFilter()
    ]

    return container([
        sliderBodySprite,
    ])
}
