import type { Beatmap } from '@osucad/core';
import { BoxedBeatmap, RulesetStore, StableBeatmapParser } from '@osucad/core';
import { OsuRuleset } from '@osucad/ruleset-osu';
import config from 'config';
import express from 'express';


const app = express();

app.use(express.json({limit: Number.MAX_VALUE}))

RulesetStore.register(new OsuRuleset().rulesetInfo);
// RulesetStore.register(new ManiaRuleset().rulesetInfo);

app.post('/parse/osu', (req, res) => {
  if (!req.body) {
    res.status(400).send('No body');
    return
  }

  const { body } = req;

  if (!body.text || typeof body.text !== 'string') {
    res.status(400).send('Invalid body');
    return
  }

  try {
    const beatmap = new StableBeatmapParser().parse(body.text);

    if (!beatmap.beatmapInfo.ruleset || !beatmap.beatmapInfo.ruleset.available) {
      res.status(400).send('Unsupported ruleset');
      return;
    }

    const ruleset = beatmap.beatmapInfo.ruleset.createInstance();

    const converter = ruleset.createBeatmapConverter(beatmap as any);

    if (!converter.canConvert()) {
      res.status(400).send('Cannot convert');
      return;
    }

    const converted = converter.convert();

    const summary = new BoxedBeatmap(converted as Beatmap).createSummary();

    res.json(summary);
  }
  catch (error) {
    res.status(500).send(error);
  }
});

const port = config.get<number>('deployment.port');

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
