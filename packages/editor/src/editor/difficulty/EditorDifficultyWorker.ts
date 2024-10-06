import { deserializeBeatmap } from '../../beatmap/serialization/Beatmap.ts';
import { OsuDifficultyCalculator } from '../../difficulty/OsuDifficultyCalculator.ts';
import { StrainSkill } from '../../difficulty/skills/StrainSkill.ts';

globalThis.addEventListener('message', (evt) => {
  const beatmap = deserializeBeatmap(evt.data);

  const difficultyCalculator = new OsuDifficultyCalculator(beatmap);

  const [difficultyAttributes, skills] = difficultyCalculator.calculate();

  const strains = [];

  for (const skill of skills) {
    if (skill instanceof StrainSkill) {
      strains.push(skill.getCurrentStrainPeaks());
    }
  }

  globalThis.postMessage({ difficultyAttributes, strains });
});
