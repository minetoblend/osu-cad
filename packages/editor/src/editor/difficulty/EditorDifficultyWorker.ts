import { StableBeatmapParser } from '@osucad/common';
import { OsuDifficultyCalculator } from '../../difficulty/OsuDifficultyCalculator';
import { StrainSkill } from '../../difficulty/skills/StrainSkill';

globalThis.addEventListener('message', async (evt) => {
  const beatmap = new StableBeatmapParser().parse(evt.data);

  const difficultyCalculator = new OsuDifficultyCalculator(beatmap);

  const [difficultyAttributes, skills] = difficultyCalculator.calculate();

  const strains = [];

  for (const skill of skills) {
    if (skill instanceof StrainSkill)
      strains.push(skill.getCurrentStrainPeaks());
  }

  globalThis.postMessage({ difficultyAttributes, strains });
});
