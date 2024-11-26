import { Beatmap } from "@osucad/common";
import { Json } from "@osucad/serialization";
import { BeatmapSerializer } from "./BeatmapSerializer";
import { expect } from "vitest";

describe('BeatmapSerializer', () => {
  it('should be tested', () => {
    const beatmap = new Beatmap()

    const encoded = new Json().encode(BeatmapSerializer, beatmap)

    console.log(encoded)

    expect(encoded).toBe('')
  })
})
