import type { ColorSource } from 'pixi.js';
import type { ReadonlyDependencyContainer } from './di/DependencyContainer';

import { Game, Vec2, WebGameHost } from '.';
import { SmoothPath } from './graphics/drawables/SmoothPath';
import './style.css';

const host = new WebGameHost('demo');

class DemoGame extends Game {
  constructor() {
    super();
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    const vertices = [
      new Vec2(100, 100),
      new Vec2(400, 200),
      new Vec2(500, 200),
    ];

    this.add(
      new DemoPath().adjust((p) => {
        p.vertices = vertices;
        p.pathRadius = 20;

        addEventListener('pointerdown', () => p.pathRadius = 100);
      }),
    );
  }
}

class DemoPath extends SmoothPath {
  override colorAt(position: number): ColorSource {
    return position < 0.5 ? 0xFF0000 : 0xFFFFFF;
  }
}

host.run(new DemoGame());
