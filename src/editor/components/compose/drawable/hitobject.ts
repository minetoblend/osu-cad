import {HitObject} from "@/editor/state/hitobject";
import {isHitCircle} from "@/editor/state/hitobject/circle";
import {createDrawableHitCircle} from "@/editor/components/compose/drawable/hitcircle.drawable";
import {EditorContext} from "@/editor";
import {isSlider} from "@/editor/state/hitobject/slider";
import {createDrawableSlider} from "@/editor/components/compose/drawable/slider.drawable";
import {Container, Renderer, Transform} from "pixi.js";
import {EffectScope, getCurrentScope} from "vue";


export function createDrawableHitObject(hitObject: HitObject, editor: EditorContext, renderer: Renderer, transform: Transform) {

    const container = new Container()
    const scope = new EffectScope()

    scope.run(() => {
        if (isHitCircle(hitObject)) {
            container.addChild(createDrawableHitCircle(hitObject, editor))
        } else if (isSlider(hitObject)) {
            container.addChild(createDrawableSlider(hitObject, editor, renderer, transform))
        }
    })

    container.once('removed', () => scope.stop())


    return container

}
