import {HitObject} from "@/editor/hitobject";
import {SerializedHitObject} from "@common/types";
import {Slider} from "@/editor/hitobject/slider";
import {shallowReactive} from "vue";
import {EditorContext} from "@/editor";
import {HitCircle} from "@/editor/hitobject/circle";
import {ServerOpCode} from "@common/opcodes";
import {Subject} from "rxjs";

export class HitObjectManager {
    constructor(readonly ctx: EditorContext) {
        this.initListeners()
    }

    readonly #hitObjects = shallowReactive<HitObject[]>([])
    readonly #selection = shallowReactive(new Set<HitObject>())

    readonly onSelectionAdded = new Subject<HitObject>()
    readonly onSelectionRemoved = new Subject<HitObject>()
    readonly onHitObjectAdded = new Subject<HitObject>()
    readonly onHitObjectUpdated = new Subject<HitObject>()
    readonly onHitObjectRemoved = new Subject<HitObject>()

    get hitObjects() {
        return this.#hitObjects
    }

    findHitObjectIndex(time: number): { found: boolean, index: number } {
        let index = 0
        let left = 0;
        let right = this.#hitObjects.length - 1;
        while (left <= right) {
            index = left + ((right - left) >> 1);
            let commandTime = this.#hitObjects[index].time;
            if (commandTime == time)
                return {found: true, index};
            else if (commandTime < time)
                left = index + 1;
            else right = index - 1;
        }
        index = left;
        return {found: false, index};
    }

    getHitObjectsInRange(time: number, startPadding: number, endPadding: number = startPadding, andSelected = false): HitObject[] {
        const objects = this.#hitObjects.map((it, index) => [it, index] as [HitObject, number]).filter(([hitObject, index]) =>
            (andSelected && hitObject.selectedBy.value === this.ctx.state.user.sessionId) || (hitObject.overriddenEndTime + endPadding) > time && (hitObject.overriddenTime - startPadding) < time
        )
        if (objects.length === 0) return []
        const firstIndex = objects[0][1]
        const lastIndex = objects[objects.length - 1][1]
        return this.hitObjects.slice(
            Math.max(firstIndex - 1, 0),
            Math.min(lastIndex + 1, this.hitObjects.length)
        )
    }

    addHitObject(hitObject: HitObject) {
        let {index} = this.findHitObjectIndex(hitObject.time)
        this.#hitObjects.splice(index, 0, hitObject)
        hitObject.applyDefaults(this.ctx.state.beatmap, this.ctx)

        this.onHitObjectAdded.next(hitObject)
    }

    initFrom(seralized: SerializedHitObject[]) {
        this.hitObjects.forEach(it => {
            it.destroyed = true
            this.onHitObjectRemoved.next(it)
        })
        this.#hitObjects.splice(0)
        const hitObjects = seralized.map(it => {
            switch (it.type) {
                case "circle":
                    const circle = new HitCircle()
                    circle.updateFrom(it)
                    return circle
                case "slider":
                    const slider = new Slider()
                    slider.updateFrom(it)
                    return slider
            }
        }).filter(it => it) as HitObject[]

        hitObjects.forEach(it => this.addHitObject(it))
        this.calculateCombos()
    }

    findById(id: string) {
        return this.#hitObjects.find(it => it.id === id)
    }

    setSelectedBy(ids: string[], selectedBy: string | null) {
        ids.forEach(id => {
            const hitObject = this.findById(id)
            if (hitObject) {
                if (selectedBy === this.ctx.state.user.sessionId && !hitObject.selectedBy.value) {
                    this.onSelectionAdded.next(hitObject)
                } else if (hitObject.selectedBy.value === this.ctx.state.user.sessionId && selectedBy === null) {
                    console.log('selection removed')
                    console.log(hitObject.selectedBy.value, selectedBy)
                    this.onSelectionRemoved.next(hitObject)
                }

                hitObject.selectedBy.value = selectedBy
            }
        })
        this.#selection.clear()
        this.hitObjects.forEach(h => {
            if (h.selectedBy.value === this.ctx.state.user.sessionId)
                this.#selection.add(h)
        })
    }

    get selection() {
        return [...this.#selection.values()]
    }

    private initListeners() {
        this.onSelectionAdded.subscribe(t => {
            this.#selection.add(t)
        })
        this.onSelectionRemoved.subscribe(t => {
            this.#selection.delete(t)
            t.clearOverrides()
        })

        this.onHitObjectAdded.subscribe(hitObject => {
            if (hitObject.selectedBy.value === this.ctx.state.user.sessionId)
                this.onSelectionAdded.next(hitObject)

            this.calculateCombos()
        })
        this.onHitObjectRemoved.subscribe(hitObject => {
            if (hitObject.selectedBy.value === this.ctx.state.user.sessionId)
                this.onSelectionRemoved.next(hitObject)
        })
        this.onHitObjectUpdated.subscribe(() => {
            this.calculateCombos()
        })


        this.ctx.commandHandler.onCommand.subscribe(({opCode, payload}) => {
            switch (opCode) {
                case ServerOpCode.HitObjectCreated:
                    this.createHitObject(payload)
                    break;

                case ServerOpCode.HitObjectUpdated:
                    this.updateHitObject(payload)
                    break;

                case ServerOpCode.HitObjectOverride:

                    if (this.selection.some(it => it.id === payload.id)) {
                        return;
                    }
                    this.setOverrides(payload.id, payload.overrides, true)
                    break;

                case ServerOpCode.HitObjectDeleted:
                    this.deleteHitObjects(payload.ids)
                    break;
            }
        })
    }

    setOverrides(id: string, overrides: Record<string, any>, animated = false) {
        this.findById(id)?.applyOverrides(overrides, animated)
    }

    deleteHitObjects(ids: string[]) {
        ids.forEach(id => {
            const index = this.#hitObjects.findIndex(it => it.id === id)
            if (index >= 0) {
                const hitObject = this.#hitObjects[index]
                hitObject.destroyed = true
                this.#hitObjects.splice(index, 1)
                this.onHitObjectRemoved.next(hitObject)
            }
        })
    }

    createHitObject(serialized: SerializedHitObject) {
        switch (serialized.type) {
            case "circle":
                const circle = new HitCircle()
                circle.updateFrom(serialized)
                this.addHitObject(circle)
                break
            case "slider":
                const slider = new Slider()
                slider.updateFrom(serialized)
                this.addHitObject(slider)
        }
    }

    private updateHitObject(serialized: SerializedHitObject) {
        const o = this.findById(serialized.id)
        if (o) {
            o.clearOverrides()
            o.updateFrom(serialized)
            this.onHitObjectUpdated.next(o)
        }
    }

    calculateCombos() {
        let currentComboNumber = 1
        let currentComboIndex = 0

        for (let i = 0; i < this.hitObjects.length; i++) {
            const hitObject = this.hitObjects[i]

            if (hitObject.newCombo) {
                currentComboIndex += 1 + hitObject.comboOffset.value
                currentComboNumber = 1
            }
            hitObject.comboIndex.value = currentComboIndex
            hitObject.comboNumber.value = currentComboNumber

            currentComboNumber++
        }
    }
}