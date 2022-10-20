import {EditorContext} from "@/editor";
import {ref} from "vue";
import {SerializedDifficulty} from "@common/types";

export class DifficultyManager {
    constructor(readonly ctx: EditorContext) {

    }

    initFrom(serialized: SerializedDifficulty) {
        this.sliderMultiplier.value = serialized.sliderMultiplier
        this.approachRate.value = serialized.approachRate
        this.circleSize.value = serialized.circleSize
        this.overallDifficulty.value = serialized.overallDifficulty
        this.hpDrainRate.value = serialized.hpDrainRate
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