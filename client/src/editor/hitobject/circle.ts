import {HitObject, HitObjectOverrides} from "@/editor/hitobject/index";
import {Serialized} from 'osucad-gameserver'

export class HitCircle extends HitObject<HitCircleOverrides> {

    constructor() {
        super({
            position: null,
            time: null,
            selectedBy: null,
            newCombo: null,
        });
    }

    serialized(overrides?: Partial<HitCircleOverrides>): Serialized.HitObject {
        return {
            id: this.id,
            startTime: overrides?.time ?? this.time,
            selectedBy: this.selectedBy.value,
            position: overrides?.position?.rounded ?? this.position.rounded,
            newCombo: overrides?.newCombo ?? this.newCombo,
            data: {type: 'circle'}
        };
    }
}

export interface HitCircleOverrides extends HitObjectOverrides {
}