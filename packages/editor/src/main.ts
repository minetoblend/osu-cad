import {
  Axes,
  Box,
  dependencyLoader,
  FillDirection,
  FillFlowContainer,
  Game,
  Vec2,
  WebGameHost,
} from 'osucad-framework';

import './style.css';
import { Toggle } from './userInterface/Toggle.ts';
import { Fit, ScalingContainer } from './editor/ScalingContainer.ts';

class TestGame extends Game {
  constructor() {
    super();
  }

  #innerContainer = new ScalingContainer({
    desiredSize: {
      x: 960,
      y: 768,
    },
    fit: Fit.Fill,
  });

  @dependencyLoader()
  load() {
    this.add(new Box({
      relativeSizeAxes: Axes.Both,
      color: 0x222228,
    }));

    this.add(this.#innerContainer);

    this.#innerContainer.add(new FillFlowContainer({
      relativeSizeAxes: Axes.Both,
      children: [
        new FillFlowContainer({
          relativeSizeAxes: Axes.Both,
          direction: FillDirection.Vertical,
          padding: 100,
          spacing: new Vec2(10, 10),
          children: [
            new Toggle(),
          ],
        }),
      ],
    }));
  }

}

async function main() {
  const host = new WebGameHost('osucad', {
    friendlyGameName: 'osucad',
  });

  await host.run(new TestGame());
}

main();
