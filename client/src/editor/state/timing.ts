import {reactive} from "vue";
import {EditorContext} from "@/editor";
import {TimingPoint as TimingPointData} from "protocol/commands";

export class TimingManager {
    constructor(readonly ctx: EditorContext) {
        this.ctx.connector.onCommand('timingPointCreated').subscribe(payload => {
            const timingPoint = new TimingPoint()
            timingPoint.updateFrom(payload)
            this.addTimingPoint(timingPoint)
            this.ctx.beatmap.hitobjects.applyDefaults()
        })

        this.ctx.connector.onCommand('timingPointUpdated').subscribe(payload => {
            const timingPoint = this.findById(payload.id)
            if (!timingPoint) {
                throw new Error(`Attempted to update unknown timing point ${payload.id}`)
            }

            timingPoint.updateFrom(payload)

            this.#timingPoints.sort((a, b) => a.time - b.time)
            this.#uninheritedTimingPoints.sort((a, b) => a.time - b.time)

            this.ctx.beatmap.hitobjects.hitObjects.forEach(it => it.applyDefaults(this.ctx.beatmap, this.ctx))
            this.ctx.beatmap.hitobjects.applyDefaults()
        })

        this.ctx.connector.onCommand('timingPointDeleted').subscribe(id => {
            this.removeTimingPoint(id)
            this.ctx.beatmap.hitobjects.applyDefaults()
        })

        this.ctx.connector.onCommand('state').subscribe(state => {
            this.timingPoints = []
            state.beatmap!.timingPoints!.forEach(t => {
                this.addTimingPoint(new TimingPoint(t))
            })
        })
    }


    #timingPoints = reactive<TimingPoint[]>([])
    #uninheritedTimingPoints = reactive<TimingPoint[]>([])

    get baseSv() {
        if (this.ctx.beatmapId === '1602707_3273002')
            return 3.6
        return 1.4
    }

    get timingPoints() {
        return this.#timingPoints
    }

    set timingPoints(value: TimingPoint[]) {
        this.#timingPoints.splice(0)
        this.#timingPoints.push(...value)

        this.#uninheritedTimingPoints.splice(0)
        this.#uninheritedTimingPoints.push(...value.filter(it => !it.isInherited))
    }

    get uninheritedTimingPoints() {
        return this.#uninheritedTimingPoints
    }

    addTimingPoint(timingPoint: TimingPoint) {
        const index = this.findTimingPointIndex(this.#timingPoints, timingPoint.time).index
        this.#timingPoints.splice(index, 0, timingPoint)

        if (!timingPoint.isInherited) {
            const uninheritedIndex = this.findTimingPointIndex(this.#uninheritedTimingPoints, timingPoint.time).index
            this.#uninheritedTimingPoints.splice(uninheritedIndex, 0, timingPoint)

        }
    }

    findTimingPointIndex(timingPoints: TimingPoint[], time: number): { found: boolean, index: number } {
        let index = 0
        let left = 0;
        let right = timingPoints.length - 1;
        while (left <= right) {
            index = left + ((right - left) >> 1);
            let commandTime = timingPoints[index].time;
            if (commandTime == time)
                return {found: true, index};
            else if (commandTime < time)
                left = index + 1;
            else right = index - 1;
        }
        index = left;
        return {found: false, index};
    }

    removeTimingPoint(id: number) {
        const index = this.#timingPoints.findIndex(it => it.id === id)
        if (index >= 0)
            this.#timingPoints.splice(index, 1)

        const uninheritedIndex = this.#uninheritedTimingPoints.findIndex(it => it.id === id)
        if (uninheritedIndex >= 0)
            this.#uninheritedTimingPoints.splice(uninheritedIndex, 1)
    }

    findById(id: number): TimingPoint | undefined {
        return this.#timingPoints.find(it => it.id === id)
    }

    getTimingPointAt(time: number, uninherited: boolean = false): TimingPoint | undefined {
        if (this.#timingPoints.length === 0 || (uninherited && this.#uninheritedTimingPoints.length === 0))
            return undefined

        let {index, found} = this.findTimingPointIndex(
            uninherited ? this.#uninheritedTimingPoints : this.#timingPoints,
            time
        )

        if (!found && index > 0)
            index--;

        return uninherited ? this.#uninheritedTimingPoints[index] : this.#timingPoints[index]
    }
    
}

export class TimingPoint {

    id!: number
    time = 0

    timing?: {
        bpm: number
        signature: number
    }
    sv?: number
    volume?: number

    constructor(init?: TimingPointData) {
        if (init)
            this.updateFrom(init)
    }

    updateFrom(timingPoint: TimingPointData) {
        this.id = timingPoint.id
        this.time = timingPoint.offset
        this.timing = timingPoint.timing
        this.sv = timingPoint.sv
        this.volume = timingPoint.volume
    }

    get isInherited() {
        return !this.timing
    }

    serialized(): TimingPointData {
        let timing = this.timing ? {
            bpm: this.timing.bpm,
            signature: this.timing.signature
        } : undefined

        return {
            id: this.id,
            offset: this.time,
            timing,
            volume: this.volume,
            sv: this.sv,
        }
    }

    get bpm() {
        return this.timing?.bpm
    }

    get beatDuration() {
        const bpm = this.bpm
        if (bpm) {
            return 60_000 / bpm
        }
        return undefined
    }


    get beatLength() {
        if (this.timing)
            return 60_000 / this.timing.bpm
        return undefined
    }


}

export function* generateTicks(uninheritedTimingPoints: TimingPoint[], startTime: number, endTime: number, divisor: number) {
    if (uninheritedTimingPoints.length === 0) {
        return []
    }

    let {index, found} = findTimingPointIndex(uninheritedTimingPoints, startTime)
    if (!found && index > 0)
        index--;

    let sectionStartTime = startTime
    do {
        const timingPoint = uninheritedTimingPoints[index]
        let sectionEndTime = Math.min(endTime, uninheritedTimingPoints[index + 1]?.time ?? endTime)


        const ticks = [...generateTicksForTimingPoint(timingPoint.time, timingPoint.beatLength!, sectionStartTime, sectionEndTime, divisor)]

        yield* ticks

        index++
        sectionStartTime = sectionEndTime
    } while ((uninheritedTimingPoints[index] && uninheritedTimingPoints[index].time < endTime))
}

export function findTimingPointIndex(timingPoints: TimingPoint[], time: number) {
    let index = 0
    let left = 0;
    let right = timingPoints.length - 1;
    while (left <= right) {
        index = left + ((right - left) >> 1);
        let commandTime = timingPoints[index].time;
        if (commandTime == time)
            return {found: true, index};
        else if (commandTime < time)
            left = index + 1;
        else right = index - 1;
    }
    index = left;
    return {found: false, index};
}

export function findCurrentTimingPoint(uninheritedTimingPoints: TimingPoint[], time: number): TimingPoint | undefined {
    let {index, found} = findTimingPointIndex(uninheritedTimingPoints, time)
    if (!found && index > 0)
        index--;
    return uninheritedTimingPoints[index]
}

export function snapTime(timingPoints: TimingPoint[], time: number, divisor: number): number {
    if (timingPoints.length === 0)
        return time
    const timingPoint = findCurrentTimingPoint(timingPoints, time)
    if (!timingPoint)
        return time
    const snapLength = timingPoint.beatLength! / divisor

    let differenceInBeats = (time - timingPoint.time) / snapLength
    return timingPoint.time + Math.round(differenceInBeats) * snapLength

}


export function* generateTicksForTimingPoint(offset: number, beatLength: number, startTime: number, endTime: number, divisor: number): Generator<TimingTick> {
    let time = startTime + (offset - startTime) % beatLength //- beatLength

    let i = 0
    while (Math.round(time) < endTime) {
        const t = i * 12 / divisor

        let type: TimingTickType;
        if (t === 0) {
            type = TimingTickType.Full
        } else if (t === 6) {
            type = TimingTickType.Half
        } else if (t % 4 === 0) {
            type = TimingTickType.Third
        } else if (t % 3 === 0) {
            type = TimingTickType.Quarter
        } else if (t % 2 === 0) {
            type = TimingTickType.Sixth
        } else {
            type = TimingTickType.Other
        }
        yield {
            time: Math.round(time),
            type,
        }

        time += beatLength / divisor
        i = (i + 1) % divisor
    }
}

export interface TimingTick {
    time: number
    type: TimingTickType
}

export enum TimingTickType {
    Full,
    Half,
    Third,
    Quarter,
    Sixth,
    Other,
}