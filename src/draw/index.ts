import {PIXI} from "@/pixi";

export class ResourceProvider {

    async load() {

    }
}

export class OsuCadContainer extends PIXI.Container {
    constructor(readonly resourceProvider: ResourceProvider) {
        super();
    }
}