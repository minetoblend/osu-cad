import {Serialized} from "osucad-gameserver";

export interface HitObjectV1 extends Omit<Serialized.HitObject, 'id'> {
}