import {OsuCadContainer, ResourceProvider} from "@/draw/index";
import {PIXI} from "@/pixi";
import {DrawableHitObject} from "@/draw/HitObject";

export class Playfield extends OsuCadContainer {
    private grid: PIXI.Graphics;
    private hitObjectContainer: PIXI.Container

    constructor(resourceProvider: ResourceProvider) {
        super(resourceProvider);
        const g = new PIXI.Graphics()

        g.lineStyle(2, 0xFFFFFF, 0.5)
        g.drawRoundedRect(0, 0, 512, 384, 5)

        this.addChild(g)

        this.grid = new PIXI.Graphics()
        this.grid.alpha = 0.3

        this.initGrid()
        this.addChild(this.grid)

        this.hitObjectContainer = new PIXI.Container
        this.addChild(this.hitObjectContainer)
    }

    initGrid(gridSize: number = 32) {
        this.grid.clear()
        this.grid.lineStyle(1, 0xFFFFFF, 0.6)

        for (let y = gridSize; y < 384; y += gridSize) {
            if (Math.abs(y - 384 / 2) < 2)
                continue
            this.grid.moveTo(0, y)
            this.grid.lineTo(512, y)
        }
        for (let x = gridSize; x < 512; x += gridSize) {
            if (Math.abs(x - 512 / 2) < 2)
                continue
            this.grid.moveTo(x, 0)
            this.grid.lineTo(x, 384)
        }
        this.grid.lineStyle(2, 0xFFFFFF)
        this.grid.moveTo(512 / 2, 0)
        this.grid.lineTo(512 / 2, 384)
        this.grid.moveTo(0, 384 / 2)
        this.grid.lineTo(512, 384 / 2)
    }


    addHitObjectDrawable(drawable: DrawableHitObject) {
        this.hitObjectContainer.addChild(drawable)
    }

    removeHitObjectDrawable(drawable: DrawableHitObject) {
        this.hitObjectContainer.removeChild(drawable)
    }
}