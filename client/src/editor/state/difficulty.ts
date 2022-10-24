import {EditorContext} from "@/editor";
import {ref} from "vue";

export class DifficultyManager {
    constructor(readonly ctx: EditorContext) {
        this.ctx.connector.onCommand('state').subscribe(state => {
            this.hpDrainRate.value = state.difficulty.hpDrainRate
            this.circleSize.value = state.difficulty.circleSize
            this.approachRate.value = state.difficulty.approachRate
            this.overallDifficulty.value = state.difficulty.overallDifficulty
            this.sliderMultiplier.value = state.difficulty.sliderMultiplier
        })
    }

    sliderMultiplier = ref(1.4)
    approachRate = ref(8.5)
    circleSize = ref(4)
    overallDifficulty = ref(8.5)
    hpDrainRate = ref(5)

    get circleRadius() {
        return 32
    }

}