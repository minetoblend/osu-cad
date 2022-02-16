import {OsuCadContainer, ResourceProvider} from "@/draw/index";
import {PIXI} from "@/pixi";

export class Playfield extends OsuCadContainer {

    constructor(resourceProvider: ResourceProvider) {
        super(resourceProvider);



        const g = new PIXI.Graphics()

        g.lineStyle(2, 0xFFFFFF, 0.5)
        g.drawRoundedRect(0, 0, 512, 384, 5)

        this.addChild(g)
    }
}