import {EditorContext} from "@/editor";
import {SerializedBeatmapMetadata} from "@common/types";
import {ref, shallowReactive} from "vue";
import {Color} from "@/util/math";


export class MetadataManager {

    constructor(readonly ctx: EditorContext) {
    }

    #comboColors = ref<Color[]>([
        new Color(225,218,149).divF(255),
        new Color(167, 105, 150).divF(255)])

    initFrom(metadata: SerializedBeatmapMetadata) {

    }

    getComboColor(index: number) {
        return this.#comboColors.value[index % this.#comboColors.value.length] ?? Color.white
    }

}