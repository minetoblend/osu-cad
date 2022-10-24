import {ViewportTool} from "@/editor/viewport/tools/index";
import {Container, Sprite, Texture} from "pixi.js";
import {Vec2} from "@/util/math";
import circlePiece from "@/assets/skin/hitcircleoverlay.png";
import {DragEvent} from "@/util/drag";
import {HitCircle} from "@/editor/hitobject/circle";

export class CircleCreateTool extends ViewportTool {

    overlayContainer = new Container()

    #cursor = new Sprite(Texture.from(circlePiece))

    constructor() {
        super();
        this.#cursor.anchor.set(0.5)
        this.#cursor.scale.set(0.5)
    }

    onMouseMove(mousePos: Vec2) {
        this.#cursor.position.copyFrom(mousePos)
    }

    onToolActivated() {
        this.overlayContainer.removeChildren()
        this.overlayContainer.addChild(this.#cursor)
    }

    onMouseDown(evt: DragEvent) {
        if (evt.leftMouseButton) {
            const circle = new HitCircle()
            circle.position = evt.current
            circle.time = this.ctx.currentTime
            this.sendMessage('createHitObject', circle.serialized())
        } else if (evt.rightMouseButton) {
            this.manager.toolId = 'select'
        }
    }


}