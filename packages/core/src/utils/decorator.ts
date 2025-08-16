
import { Vec2 } from "@osucad/framework";
import { createTypeDecorator, serializer } from "@osucad/multiplayer-core";
import { HitSoundInfo } from "../audio/HitSoundInfo";
import type { SampleAdditions } from "../audio/SampleAdditions";
import type { SampleSet } from "../audio/SampleSet";


export const customType = createTypeDecorator({
  vec2: serializer<Vec2, string>({
    serialize: value => [value.x.toFixed(1), value.y.toFixed(1)].join(","),
    deserialize: value =>
    {
      const [x, y] = value.split(",");
      return new Vec2(Number.parseFloat(x), Number.parseFloat(y));
    },
    equals: (a, b) => a.equals(b),
  }),
  hitSoundInfo: serializer<HitSoundInfo, [SampleSet, SampleSet, SampleAdditions]>({
    serialize: value => [value.sampleSet, value.additionSampleSet, value.additions],
    deserialize: value => new HitSoundInfo(value[0], value[1], value[2]),
  }),
});


