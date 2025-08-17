
import { Vec2 } from "@osucad/framework";
import { createTypeDecorator, serializer } from "@osucad/multiplayer-core";
import { HitSoundInfo } from "../audio/HitSoundInfo";
import type { SampleAdditions } from "../audio/SampleAdditions";
import type { SampleSet } from "../audio/SampleSet";


export const customType = createTypeDecorator({
  vec2: serializer<Vec2, [number, number]>({
    serialize: value => [Math.round(value.x * 10), Math.round(value.y * 10)],
    deserialize: ([x, y]) => new Vec2(x / 10, y / 10),
    equals: (a, b) => a.equals(b),
  }),
  hitSoundInfo: serializer<HitSoundInfo, [SampleSet, SampleSet, SampleAdditions]>({
    serialize: value => [value.sampleSet, value.additionSampleSet, value.additions],
    deserialize: value => new HitSoundInfo(value[0], value[1], value[2]),
  }),
});


