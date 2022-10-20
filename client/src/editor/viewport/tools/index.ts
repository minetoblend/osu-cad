import {Container} from "pixi.js";
import {PlayfieldDrawable} from "@/editor/viewport/playfield";
import {EditorContext} from "@/editor";
import {BeatmapState} from "@/editor/state/beatmap";
import {Vec2} from "@/util/math";
import {DrawableHitObject} from "@/editor/viewport/drawable/hitobject";
import {HitObject} from "@/editor/hitobject";
import {ClientMessages, ClientOpCode} from "@common/opcodes";
import {DragEvent} from "@/util/drag";
import {ToolManager} from "@/editor/viewport/tools/manager";
import {DropdownOption} from "naive-ui";
import {MatchEvent} from "@/editor/connector";
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
            .filter(it => !selectable || (!it.hitObject!.selectedBy.value || it.hitObject!.selectedBy.value === this.ctx.state.user.sessionId))
            .filter(it => it.isMouseInside(pos))
            .filter(it => it.isVisibleAt(this.ctx.currentTime))
            .filter(it => !it.hitObject!.destroyed)
            .map(it => it.hitObject) as HitObject[]
    }

    getCirclesAt(pos: Vec2, selectable = false): HitCircle[] {
        return (this.drawableHitObjects as DrawableHitObject[])
            .filter(it => it.hitObject instanceof HitCircle)
            .filter(it => !selectable || (!it.hitObject!.selectedBy.value || it.hitObject!.selectedBy.value === this.ctx.state.user.sessionId))
            .filter(it => it.isMouseInside(pos))
            .filter(it => it.isVisibleAt(this.ctx.currentTime))
            .filter(it => !it.hitObject!.destroyed)
            .map(it => it.hitObject) as HitCircle[]
    }

    getSlidersAt(pos: Vec2, selectable = false): Slider[] {
        return (this.drawableHitObjects as DrawableHitObject[])
            .filter(it => it.hitObject instanceof Slider)
            .filter(it => !selectable || (!it.hitObject!.selectedBy.value || it.hitObject!.selectedBy.value === this.ctx.state.user.sessionId))
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
        return this.sendMessage(ClientOpCode.SelectHitObject, {
            ids: objects.map(it => it.id),
            selected: true,
            unique: true
        })
    }

    addToSelection(...objects: HitObject[]) {
        return this.sendMessage(ClientOpCode.SelectHitObject, {
            ids: objects.map(it => it.id),
            selected: true,
            unique: false
        })
    }

    deselect(...objects: HitObject[]) {
        return this.sendMessage(ClientOpCode.SelectHitObject, {
            ids: objects.map(it => it.id),
            selected: false,
            unique: false
        })
    }

    deselectAll() {
        return this.sendMessage(ClientOpCode.SelectHitObject, {
            ids: [],
            selected: false,
            unique: true
        })
    }

    // endregion


    // region operation

    #operationInterval: NodeJS.Timer | undefined = undefined
    #operationScheduledCommands: [ClientOpCode, any][] = []

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


    sendOperationCommands(commands: [ClientOpCode, any][]) {
        this.#operationScheduledCommands = commands
    }

    sendOperationCommand<T extends keyof ClientMessages>(opCode: T, ...params: Parameters<ClientMessages[T]>) {
        this.#operationScheduledCommands = [[opCode, params[0]]]
    }

    #operationUpdate() {
        if (this.#operationScheduledCommands.length > 0) {

            this.#operationScheduledCommands.forEach(([opCode, payload]) => {
                this.sendMessage(opCode as keyof ClientMessages, payload)
            })

            this.#operationScheduledCommands = []
        }
    }

    // endregion

    sendMessage<T extends keyof ClientMessages>(opCode: T, ...params: Parameters<ClientMessages[T]>) {
        return this.ctx.sendMessage(opCode, ...params)
    }

    sendMessageWithResponse<T extends keyof ClientMessages>(opCode: T, ...params: Parameters<ClientMessages[T]>): Promise<MatchEvent> {
        return this.ctx.sendMessageWithResponse(opCode, ...params)
    }

    deleteHitObjects(...hitObjects: HitObject[]) {
        if (hitObjects.length > 0)
            return this.ctx.sendMessage(ClientOpCode.DeleteHitObject, {ids: hitObjects.map(it => it.id)})
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


