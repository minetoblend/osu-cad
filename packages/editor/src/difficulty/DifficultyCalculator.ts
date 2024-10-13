import type { Beatmap } from '../beatmap/Beatmap';
import type { DifficultyAttributes } from './DifficultyAttributes';
import type { DifficultyHitObject } from './preprocessing/DifficultyHitObject';
import type { Skill } from './skills/Skill';

export abstract class DifficultyCalculator<T extends DifficultyHitObject<any>> {
  #clockRate = 1;

  protected constructor(protected readonly beatmap: Beatmap) {
  }

  calculate(): [DifficultyAttributes, Skill<T>[]] {
    const skills = this.createSkills(this.beatmap, this.#clockRate);

    if (this.beatmap.hitObjects.length === 0) {
      return [
        this.createDifficultyAttributes(this.beatmap, skills, this.#clockRate),
        skills,
      ];
    }

    for (const hitObject of this.#getDifficultyHitObjects()) {
      for (const skill of skills)
        skill.process(hitObject);
    }

    return [
      this.createDifficultyAttributes(this.beatmap, skills, this.#clockRate),
      skills,
    ];
  }

  #getDifficultyHitObjects() {
    return this.createDifficultyHitObjects(this.beatmap, this.#clockRate).sort((a, b) => a.baseObject.startTime - b.baseObject.startTime);
  }

  protected abstract createDifficultyAttributes(beatmap: Beatmap, skills: Skill<T>[], clockRate: number): DifficultyAttributes;

  protected abstract createSkills(beatmap: Beatmap, clockRate: number): Skill<T>[];

  protected abstract createDifficultyHitObjects(beatmap: Beatmap, clockRate: number): T[];
}
