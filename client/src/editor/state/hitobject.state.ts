import {HitObject} from "@/editor/hitobject";
import {Slider} from "@/editor/hitobject/slider";
import {shallowReactive} from "vue";
import {EditorContext} from "@/editor";
import {HitCircle} from "@/editor/hitobject/circle";
import {Subject} from "rxjs";
import {HitObject as HitObjectData} from 'protocol/commands'

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
        const objects = this.#hitObjects.map((it, index) => [it, index] as [HitObject, number]).filter(([hitObject]) =>
            (andSelected && hitObject.selectedBy.value === this.ctx.users.sessionId) || (hitObject.overriddenEndTime + endPadding) > time && (hitObject.overriddenTime - startPadding) < time
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
        hitObject.applyDefaults(this.ctx.beatmap, this.ctx)

        this.onHitObjectAdded.next(hitObject)
    }


    findById(id: number) {
        return this.#hitObjects.find(it => it.id === id)
    }

    setSelectedBy(ids: number[], selectedBy: number | null) {
        ids.forEach(id => {
            const hitObject = this.findById(id)
            if (hitObject) {
                if (selectedBy === this.ctx.users.sessionId && !hitObject.selectedBy.value) {
                    this.onSelectionAdded.next(hitObject)
                } else if (hitObject.selectedBy.value === this.ctx.users.sessionId && selectedBy === null) {
                    this.onSelectionRemoved.next(hitObject)
                }

                hitObject.selectedBy.value = selectedBy
            }
        })
        this.#selection.clear()
        this.hitObjects.forEach(h => {
            if (h.selectedBy.value === this.ctx.users.sessionId)
                this.#selection.add(h)
        })
    }

    get selection() {
        return [...this.#selection.values()]
    }

    #addSerializedHitObject(hitObject: HitObjectData) {
        switch (hitObject.kind?.$case) {
            case 'circle':
                const circle = new HitCircle()
                circle.updateFrom(hitObject)
                this.addHitObject(circle)
                break;

            case 'slider':
                const slider = new Slider()
                slider.updateFrom(hitObject)
                this.addHitObject(slider)
                break;
        }
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
            if (hitObject.selectedBy.value === this.ctx.users.sessionId)
                this.onSelectionAdded.next(hitObject)

            this.calculateCombos()
        })
        this.onHitObjectRemoved.subscribe(hitObject => {
            this.calculateCombos()
            if (hitObject.selectedBy.value === this.ctx.users.sessionId)
                this.onSelectionRemoved.next(hitObject)
        })
        this.onHitObjectUpdated.subscribe(() => {
            this.calculateCombos()
        })


        this.ctx.connector.onCommand('hitObjectCreated').subscribe(hitObject =>
            this.#addSerializedHitObject(hitObject)
        )

        this.ctx.connector.onCommand('hitObjectSelected').subscribe(selection => {
            this.setSelectedBy(selection.ids, selection.selectedBy ?? null)
        })

        this.ctx.connector.onCommand('hitObjectUpdated').subscribe(hitObject => {
            const o = this.findById(hitObject.id)
            if (o){
                o.updateFrom(hitObject)
                this.onHitObjectUpdated.next(o)
            }
        })

        this.ctx.connector.onCommand('hitObjectDeleted').subscribe(id => {
            this.deleteHitObjects([id])
        })

        this.ctx.connector.onCommand('state').subscribe(state => {
            this.deleteHitObjects(this.hitObjects.map(it => it.id))
            state.beatmap!.hitObjects!.forEach(hitObject => this.#addSerializedHitObject(hitObject))
        })

        this.ctx.connector.onCommand('hitObjectOverridden').subscribe(({id, overrides}) => {
            const h = this.findById(id)
            if (h && h.selectedBy.value !== this.ctx.users.sessionId) {
                this.setOverrides(id, {
                    ...overrides,
                    controlPoints: overrides!.controlPoints?.controlPoints ?? null
                } as any, true)
            }
        })
    }

    setOverrides(id: number, overrides: Record<string, any>, animated = false) {
        this.findById(id)?.applyOverrides(overrides, animated)
    }

    deleteHitObjects(ids: number[]) {
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

    applyDefaults() {
        this.hitObjects.forEach(t => t.applyDefaults(this.ctx.beatmap, this.ctx))
    }
}