import {Container} from "pixi.js";
import {PlayfieldDrawable} from "@/editor/viewport/playfield";
import {EditorContext} from "@/editor";
import {BeatmapState} from "@/editor/state/beatmap";
import {Vec2} from "@/util/math";
import {DrawableHitObject} from "@/editor/viewport/drawable/hitobject";
import {HitObject} from "@/editor/hitobject";
import {DragEvent} from "@/util/drag";
import {ToolManager} from "@/editor/viewport/tools/manager";
import {DropdownOption} from "naive-ui";
import {ClientCommandPayload, ClientCommandType} from "@/editor/connector";
import {HitCircle} from "@/editor/hitobject/circle";
import {Slider} from "@/editor/hitobject/slider";
import {DragOperation} from "@/editor/viewport/tools/operation";

export abstract class ViewportTool {

    constructor() {
    }

    ctx!: EditorContext
    beatmap!: BeatmapState
    playfield!: PlayfieldDrawable
    manager!: ToolManager

    overlayContainer?: Container

    get drawableHitObjects(): DrawableHitObject[] {
        return (this.playfield.hitObjectContainer.children as DrawableHitObject[]).filter(it => !it.destroyed)

    }

    getHitObjectsAt(pos: Vec2, selectable = false): HitObject[] {
        return (this.drawableHitObjects as DrawableHitObject[])
            .filter(it => !selectable || (!it.hitObject!.selectedBy.value || it.hitObject!.selectedBy.value === this.ctx.users.sessionId))
            .filter(it => it.isMouseInside(pos))
            .filter(it => it.isVisibleAt(this.ctx.currentTime))
            .filter(it => !it.hitObject!.destroyed)
            .map(it => it.hitObject) as HitObject[]
    }

    getCirclesAt(pos: Vec2, selectable = false): HitCircle[] {
        return (this.drawableHitObjects as DrawableHitObject[])
            .filter(it => it.hitObject instanceof HitCircle)
            .filter(it => !selectable || (!it.hitObject!.selectedBy.value || it.hitObject!.selectedBy.value === this.ctx.users.sessionId))
            .filter(it => it.isMouseInside(pos))
            .filter(it => it.isVisibleAt(this.ctx.currentTime))
            .filter(it => !it.hitObject!.destroyed)
            .map(it => it.hitObject) as HitCircle[]
    }

    getSlidersAt(pos: Vec2, selectable = false): Slider[] {
        return (this.drawableHitObjects as DrawableHitObject[])
            .filter(it => it.hitObject instanceof Slider)
            .filter(it => !selectable || (!it.hitObject!.selectedBy.value || it.hitObject!.selectedBy.value === this.ctx.users.sessionId))
            .filter(it => it.isMouseInside(pos))
            .filter(it => it.isVisibleAt(this.ctx.currentTime))
            .filter(it => !it.hitObject!.destroyed)
            .map(it => it.hitObject) as Slider[]


    }

    getHitObjectAt(pos: Vec2, selectable = false): HitObject | undefined {
        return this.getHitObjectsAt(pos, selectable).pop()
    }

    // region select
    get selection() {
        return this.beatmap.hitobjects.selection
    }

    select(...objects: HitObject[]) {
        return this.sendMessage('selectHitObject', {
            ids: objects.map(it => it.id),
            selected: true,
            unique: true
        })
    }

    addToSelection(...objects: HitObject[]) {
        return this.sendMessage('selectHitObject', {
            ids: objects.map(it => it.id),
            selected: true,
            unique: false
        })
    }

    deselect(...objects: HitObject[]) {
        return this.sendMessage('selectHitObject', {
            ids: objects.map(it => it.id),
            selected: false,
            unique: false
        })
    }

    deselectAll() {
        return this.sendMessage('selectHitObject', {
            ids: [],
            selected: false,
            unique: true
        })
    }

    // endregion


    // region operation

    #operationInterval: NodeJS.Timer | undefined = undefined
    #operationScheduledCommands: [ClientCommandType, any][] = []

    async startOperation(start?: () => any, interval = 100) {

        if (start) {
            await start()
        }

        this.#operationInterval = setInterval(() => {
            this.#operationUpdate()
        }, interval)
    }

    endOperation() {
        clearInterval(this.#operationInterval)
    }

    sendOperationCommands(commands: [ClientCommandType, any][]) {
        this.#operationScheduledCommands = commands
    }

    sendOperationCommand<T extends ClientCommandType>(opCode: T, payload: ClientCommandPayload<T>) {
        this.#operationScheduledCommands = [[opCode, payload]]
    }

    #operationUpdate() {
        if (this.#operationScheduledCommands.length > 0) {

            this.#operationScheduledCommands.forEach(([opCode, payload]) => {
                this.sendMessage(opCode, payload)
            })

            this.#operationScheduledCommands = []
        }
    }

    // endregion

    sendMessage<T extends ClientCommandType>(opCode: T, payload: ClientCommandPayload<T>) {
        this.ctx.sendMessage(opCode, payload)
    }

    deleteHitObjects(...hitObjects: HitObject[]) {
        if (hitObjects.length > 0)
            this.sendMessage('deleteHitObject', {ids: hitObjects.map(t => t.id)})
    }

    showContextMenu(options: DropdownOption[], pos: Vec2, onSelect: (value: string) => void) {
        this.manager.showContextMenu(options, pos, onSelect)
    }

    dragOperation?: DragOperation

    async beginMouseOperation(operation: DragOperation) {
        this.dragOperation = operation
        await this.startOperation()
    }

    async commitDragOperation(evt: DragEvent) {
        if (this.dragOperation) {
            this.dragOperation.commit(evt)
            this.dragOperation = undefined
            await this.endOperation()
        }
    }

}

export interface ViewportTool {

    onToolActivated?(): void

    onToolDeactivated?(): void

    onMouseDown?(evt: DragEvent): void

    onMouseUp?(evt: DragEvent): void

    onMouseMove?(mousePos: Vec2): void

    onDragStart?(evt: DragEvent): void

    onDrag?(evt: DragEvent): void

    onDragEnd?(evt: DragEvent): void

    onClick?(evt: DragEvent): void

    onKeyDown?(evt: KeyboardEvent): boolean

    onShortcut?(evt: CustomEvent): void

    onSelectionAdded?(object: HitObject): void

    onSelectionRemoved?(object: HitObject): void

    onSelectionChanged?(object: HitObject, type: 'add' | 'remove'): void

}


