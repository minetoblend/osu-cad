import {
    BaseTexture,
    BLEND_MODES,
    Container,
    DRAW_MODES,
    Geometry,
    IDestroyOptions,
    Matrix,
    Mesh,
    MSAA_QUALITY,
    Renderer,
    RenderTexture,
    Sprite,
    Texture
} from "pixi.js";

import {ref, shallowRef, watchEffect} from "vue";
import {Lifetime} from "@/util/disposable";
import {EditorContext} from "@/editor";
import {createSliderGeometry} from "@/editor/viewport/drawable/sliderGeometry";
import {SliderMaterial} from "@/editor/viewport/drawable/material";
import {Color} from "@/util/math";
import {PlayfieldDrawable} from "@/editor/viewport/playfield";
import {Slider} from "@/editor/hitobject/slider";
import {SliderTextureResource} from "@/editor/viewport/drawable/sliderTexture.resource";

export class DrawableSliderBody extends Container {

    #lifetime = new Lifetime()
    readonly #renderTexture = RenderTexture.create({width: 1, height: 1})
    readonly #texture: BaseTexture
    readonly #sliderBodySprite: Sprite
    readonly #mesh: Mesh<SliderMaterial>
    readonly #geometry: Geometry;
    readonly #material: SliderMaterial
    readonly #textureResource: SliderTextureResource;

    get sprite() {
        return this.#sliderBodySprite
    }

    constructor(readonly ctx: EditorContext, readonly renderer: Renderer, readonly playfield: PlayfieldDrawable, readonly selection = false) {
        super();


        this.#renderTexture.framebuffer.addDepthTexture()
        this.#renderTexture.framebuffer.enableDepth()
        this.#renderTexture.framebuffer.multisample = MSAA_QUALITY.HIGH

        this.#textureResource = new SliderTextureResource()
        this.#textureResource.outlineOnly = selection
        this.#texture = new BaseTexture(this.#textureResource)


        // this.#createTexture()
        this.#geometry = new Geometry()
        this.#material = new SliderMaterial(new Texture(this.#texture))

        this.#geometry.addAttribute('aVertexPosition', [])
        this.#geometry.addIndex([]);

        this.#mesh = new Mesh(this.#geometry, this.#material, undefined, DRAW_MODES.TRIANGLES)
        this.#mesh.state.blendMode = BLEND_MODES.NONE

        this.#sliderBodySprite = new Sprite(this.#renderTexture)
        this.addChild(this.#sliderBodySprite)


        this.#lifetime.add(
            watchEffect(() => this.updateGeometry()),
            watchEffect(() => this.renderSliderTexture())
        )

    }

    updateGeometry() {
        const slider = this.#slider.value
        if (!slider)
            return;
        const path = slider.overriddenPath

        let points = this.selection ? path.fullPath.value : path.snakedPath.value;

        const pointy = this.ctx.beatmapId === '1602707_3273002'

        const result = createSliderGeometry(points, this.ctx.state.beatmap.difficulty.circleRadius, pointy)

        this.#geometry.indexBuffer.update(new Uint16Array(result.indices))
        this.#geometry.getBuffer('aVertexPosition').update(result.vertices)
        this.renderSliderTexture()
    }

    renderSliderTexture() {
        const path = this.#slider.value?.overriddenPath
        if (!path) {
            return;
        }

        let scale = this.playfield.playfiedlScale.value

        this.#sliderBodySprite.scale.set(1 / scale)
        const snaked = !this.selection

        const bounds = path.getBounds(snaked)

        if (!bounds)
            throw new Error('Invalid path')

        bounds.x = Math.max(bounds.x, -1000)
        bounds.y = Math.max(bounds.y, -1000)
        bounds.width = Math.min(bounds.width, 512 + 1000)
        bounds.height = Math.min(bounds.height, 384 + 1000)

        if (bounds.width === 0 || bounds.height === 0) {
            return
        }

        const radius = this.ctx.state.beatmap.difficulty.circleRadius

        if (!path.controlPoints.value)
            console.log(path)

        const p1 = path.controlPoints.value[0].position

        const padding = 25

        this.#sliderBodySprite.position.set(
            -padding / scale + bounds.x - p1.x - radius,
            -padding / scale + bounds.y - p1.y - radius
        )

        const textureWidth = (bounds.width + radius * 2) * scale + padding * 2
        const textureHeight = (bounds.height + radius * 2) * scale + padding * 2

        if (this.#renderTexture.width !== textureWidth || this.#renderTexture.height !== textureHeight)
            this.#renderTexture.resize(textureWidth, textureHeight)


        const transform = new Matrix()
            .translate(-bounds.x + radius, -bounds.y + radius)
            .scale(scale, scale)
            .translate(padding, padding)

        this.renderer.gl.enable(this.renderer.gl.DEPTH_TEST)
        this.renderer.render(this.#mesh!, {
            renderTexture: this.#renderTexture,
            clear: true,
            transform
        })
        this.renderer.gl.disable(this.renderer.gl.DEPTH_TEST)

    }


    #slider = shallowRef<Slider>()

    bind(slider: Slider | undefined) {
        this.#slider.value = slider
    }


    destroy(_options?: IDestroyOptions | boolean) {
        super.destroy({children: true, texture: true, baseTexture: true});
        this.#lifetime.dispose()
    }

    #tint = ref(Color.white)

    get tint() {
        return this.#tint.value
    }

    set tint(value) {
        if (this.#tint.value.equals(value))
            return;
        this.#tint.value = value
        this.#textureResource.tint = value
        this.#texture.update()
        this.renderSliderTexture()
    }

    #outlineColor = ref(Color.white)

    get outlineColor() {
        return this.#outlineColor.value
    }

    set outlineColor(value) {
        if (value.equals(this.outlineColor))
            return;
        this.#outlineColor.value = value
        this.#textureResource.outlineColor = value
        this.#texture.update()
        this.renderSliderTexture()
    }


}
