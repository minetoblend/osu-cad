import {
  BeatmapDifficulty,
  HitObject,
  HitObjectCollection,
  TimingPointCollection,
} from "@osucad/common";

export function applyHitObjectDefaults(
  hitObjects: HitObjectCollection,
  difficulty: BeatmapDifficulty,
  timing: TimingPointCollection
) {
  hitObjects.on("insert", applyDefaults);
  hitObjects.on("itemChange", (hitObject, key) => {
    if (key === "startTime") {
      applyDefaults(hitObject);
    }
  });

  function updateAll() {
    hitObjects.items.forEach(applyDefaults);
  }

  timing.on("insert", updateAll);
  timing.on("itemChange", updateAll);
  timing.on("remove", updateAll);

  difficulty.on('change', updateAll)

  updateAll();

  function applyDefaults(hitObject: HitObject) {
    hitObject.applyDefaults(timing, difficulty);
  }
}
