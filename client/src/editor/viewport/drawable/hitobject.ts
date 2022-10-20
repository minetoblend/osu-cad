import {Container, Renderer} from "pixi.js";
import {HitObject} from "@/editor/hitobject";
import {EditorContext} from "@/editor";
import {PlayfieldDrawable} from "@/editor/viewport/playfield";
import {Vec2} from "@/util/math";

export abstract class DrawableHitObject extends Container {
    constructor(readonly ctx: EditorContext, readonly renderer: Renderer, readonly playfield: PlayfieldDrawable) {
        super();
    }

    abstract hitObject: HitObject | null

    abstract bindTo(hitobject: HitObject | undefined): void

    abstract update(time: number): void;

    abstract dispose(): void;

    abstract isMouseInside(mousepos: Vec2): boolean

    abstract isVisibleAt(time: number): boolean;
}
