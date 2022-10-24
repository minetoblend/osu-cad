import {
    Beatmap,
    DifficultyPoint,
    HitSample,
    HitType,
    PathPoint,
    PathType,
    SamplePoint,
    SliderPath,
    TimingPoint,
    Vector2
} from 'osu-classes'
import {BeatmapState} from "@/editor/state/beatmap";
import {BeatmapEncoder, HittableObject, SlidableObject} from 'osu-parsers'
import {HitCircle} from "@/editor/hitobject/circle";
import {Slider} from "@/editor/hitobject/slider";
import {SliderControlPointType} from "@/editor/hitobject/sliderPath";

export function exportBeatmapState(state: BeatmapState) {

    const beatmap = new Beatmap()
    const encoder = new BeatmapEncoder()

    state.timing.timingPoints.forEach(t => {
        if (t.timing) {
            const timingPoint = new TimingPoint()
            timingPoint.beatLength = t.beatLength!
            timingPoint.timeSignature = t.timing.signature
            beatmap.controlPoints.add(timingPoint, t.time)
        }
        if (t.sv) {
            const difficultyPoint = new DifficultyPoint()
            difficultyPoint.sliderVelocity = t.sv
            beatmap.controlPoints.add(difficultyPoint, t.time)
        }
        if (t.volume) {
            const samplePoint = new SamplePoint()
            samplePoint.volume = t.volume
            beatmap.controlPoints.add(samplePoint, t.time)
        }
    })

    state.hitobjects.hitObjects.forEach(h => {
        if (h instanceof HitCircle) {
            const hitObject = new HittableObject()
            hitObject.startPosition = new Vector2(h.position.x, h.position.y)
            hitObject.startTime = h.time
            hitObject.isNewCombo = h.newCombo
            hitObject.samples = [new HitSample()]
            let type = HitType.Normal
            if (hitObject.isNewCombo)
                type |= HitType.NewCombo
            hitObject.hitType = type

            beatmap.hitObjects.push(hitObject)
        }

        if (h instanceof Slider) {
            const hitObject = new SlidableObject()
            hitObject.startPosition = new Vector2(h.position.x, h.position.y)
            hitObject.startTime = h.time
            hitObject.isNewCombo = h.newCombo
            hitObject.samples = []
            for (let i = 0; i <= h.repeatCount; i++) {
                hitObject.samples.push(new HitSample())
            }

            let type = HitType.Slider
            if (hitObject.isNewCombo)
                type |= HitType.NewCombo
            hitObject.hitType = type

            const path = new SliderPath()

            switch (h.path.controlPoints.value[0].kind) {
                case SliderControlPointType.Linear:
                    path.curveType = PathType.Linear;
                    break;
                case SliderControlPointType.Circle:
                    path.curveType = PathType.PerfectCurve;
                    break;
                case SliderControlPointType.Bezier:
                    path.curveType = PathType.Bezier;
                    break;
            }

            h.path.controlPoints.value.forEach((it) => {
                let kind: PathType | null = null
                switch (it.kind) {
                    case SliderControlPointType.Linear:
                        kind = PathType.Linear;
                        break;
                    case SliderControlPointType.Bezier:
                        kind = PathType.Bezier;
                        break;
                    case SliderControlPointType.Circle:
                        kind = PathType.PerfectCurve;
                        break;
                }

                const point = new PathPoint(new Vector2(it.position.x - h.position.x, it.position.y - h.position.y), kind)
                path.controlPoints.push(point)
                if (kind)
                    path.controlPoints.push(point)
            })
            path.expectedDistance = h.path.expectedDistance
            hitObject.path = path
            hitObject.repeats = h.repeatCount - 1

            beatmap.hitObjects.push(hitObject)
        }
    })

    beatmap.general.audioFilename = 'audio.mp3'

    beatmap.difficulty.sliderMultiplier = state.difficulty.sliderMultiplier.value
    beatmap.difficulty.drainRate = state.difficulty.hpDrainRate.value
    beatmap.difficulty.circleSize = state.difficulty.circleSize.value
    beatmap.difficulty.approachRate = state.difficulty.approachRate.value
    beatmap.difficulty.overallDifficulty = state.difficulty.overallDifficulty.value

    const osuFileContent = encoder.encodeToString(beatmap)


    saveAsFile('beatmap.osu', osuFileContent)
}

function saveAsFile(filename: string, data: string) {
    const blob = new Blob([data], {type: 'application/x-osu-beatmap'});
    const elem = document.createElement('a');
    const url = URL.createObjectURL(blob);
    elem.href = url
    elem.download = filename;
    document.body.appendChild(elem);
    elem.click();
    document.body.removeChild(elem);
    URL.revokeObjectURL(url)
}
