import { StableBeatmapParser } from '../../beatmap/StableBeatmapParser.ts';
import { OsuDifficultyCalculator } from '../../difficulty/OsuDifficultyCalculator.ts';
import { StrainSkill } from '../../difficulty/skills/StrainSkill.ts';

globalThis.addEventListener('message', async (evt) => {
  const beatmap = await new StableBeatmapParser().parse(evt.data);

  const difficultyCalculator = new OsuDifficultyCalculator(beatmap);

  const [difficultyAttributes, skills] = difficultyCalculator.calculate();

  const strains = [];

  for (const skill of skills) {
    if (skill instanceof StrainSkill)
      strains.push(skill.getCurrentStrainPeaks());
  }

  globalThis.postMessage({ difficultyAttributes, strains });
});
