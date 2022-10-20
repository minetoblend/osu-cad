import {SerializedHitCircle} from "@common/types";
import {HitObject, HitObjectOverrides} from "@/editor/hitobject/index";

export class HitCircle extends HitObject<SerializedHitCircle, HitCircleOverrides> {

    constructor() {
        super({
            position: null,
            time: null,
            selectedBy: null
        });
    }

    serialized(): SerializedHitCircle {
        return {
            id: this.id,
            time: this.time,
            selectedBy: this.selectedBy.value,
            position: this.position,
            type: 'circle',
            newCombo: this.newCombo,
        }
    }
}

interface HitCircleOverrides extends HitObjectOverrides {
}