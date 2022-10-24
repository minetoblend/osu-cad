import {EditorContext} from "@/editor";
import {ref} from "vue";
import {Color} from "@/util/math";


export class MetadataManager {

    #comboColors = ref<Color[]>([
        new Color(225, 218, 149).divF(255),
        new Color(167, 105, 150).divF(255)])

    constructor(readonly ctx: EditorContext) {
    }

    getComboColor(index: number) {
        return this.#comboColors.value[index % this.#comboColors.value.length] ?? Color.white
    }

}