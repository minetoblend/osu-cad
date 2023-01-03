import {Texture} from "pixi.js";
import {shallowReactive} from "vue";
import {EditorContext, useEditor} from "@/editor/index";

export function loadSkin() {
    return shallowReactive({
        hitCircle: Texture.from('/skin/hitcircle.png'),
        hitCircleOverlay: Texture.from('/skin/hitcircleoverlay.png'),
        approachCircle: Texture.from('/skin/approachcircle.png'),
        sliderb: Texture.from('/skin/sliderb.png'),
        followPoint: Texture.from('/skin/followpoint.png'),
    }) as Skin
}

export type Skin = {
    hitCircle: Texture
    hitCircleOverlay: Texture
    approachCircle: Texture
    sliderb: Texture
    followPoint: Texture;
}

export function useSkin(editor: EditorContext = useEditor()) {
    return editor.skin
}
