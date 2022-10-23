import {SerializedHitCircle} from "@common/types";
import {HitObject, HitObjectOverrides} from "@/editor/hitobject/index";
import {HitObject as HitObjectData} from 'protocol/commands'

export class HitCircle extends HitObject<SerializedHitCircle, HitCircleOverrides> {

    constructor() {
        super({
            position: null,
            time: null,
            selectedBy: null,
            newCombo: null,
        });
    }

    serialized(overrides?: Partial<HitCircleOverrides>): HitObjectData {
        return {
            id: this.id,
            startTime: overrides?.time ?? this.time,
            selectedBy: this.selectedBy.value ?? undefined,
            position: overrides?.position ?? this.position,
            newCombo: overrides?.newCombo ?? this.newCombo,
            kind: {$case: 'circle', circle: {}}
        };
    }
}

export interface HitCircleOverrides extends HitObjectOverrides {
}