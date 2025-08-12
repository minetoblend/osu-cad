
import { Vec2 } from "@osucad/framework";
import { createTypeDecorator, serializer } from "@osucad/multiplayer-core";
import { HitSoundInfo } from "../audio/HitSoundInfo";
import type { SampleAdditions } from "../audio/SampleAdditions";
import type { SampleSet } from "../audio/SampleSet";

export const customType = createTypeDecorator({
  vec2: serializer<Vec2, [number, number]>({
    serialize: value => [value.x, value.y],
    deserialize: value => new Vec2(value[0], value[1]),
  }),
  hitSoundInfo: serializer<HitSoundInfo, [SampleSet, SampleSet, SampleAdditions]>({
    serialize: value => [value.sampleSet, value.additionSampleSet, value.additions],
    deserialize: value => new HitSoundInfo(value[0], value[1], value[2]),
  }),
});


