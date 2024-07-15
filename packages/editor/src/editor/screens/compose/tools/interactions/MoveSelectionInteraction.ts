import type { HitObject } from '@osucad/common';
import { Slider, UpdateHitObjectCommand } from '@osucad/common';
import type {
  MouseMoveEvent,
  MouseUpEvent,
} from 'osucad-framework';
import {
  MouseButton,
  Vec2,
  dependencyLoader,
} from 'osucad-framework';
import { ComposeToolInteraction } from './ComposeToolInteraction';

export class MoveSelectionInteraction extends ComposeToolInteraction {
  constructor(
    readonly hitObjects: HitObject[],
    readonly startPosition: Vec2,
  ) {
    super();
  }

  #startPositions!: Vec2[];

  @dependencyLoader()
  load() {
    this.#startPositions = this.hitObjects.map(it => it.position);
  }

  onMouseMove(e: MouseMoveEvent): boolean {
    const delta = e.mousePosition.sub(this.startPosition);

    let positions: Array<Vec2> = Array.from({ length: this.hitObjects.length });

    for (let i = 0; i < this.hitObjects.length; i++) {
      positions[i] = this.#startPositions[i]!.add(delta);
    }

    positions = this.moveIntoBounds(this.hitObjects, positions);

    for (let i = 0; i < this.hitObjects.length; i++) {
      this.submit(
        new UpdateHitObjectCommand(this.hitObjects[i], {
          position: positions[i],
        }),
        false,
      );
    }

    return true;
  }

  onMouseUp(e: MouseUpEvent): boolean {
    if (e.button === MouseButton.Left) {
      this.complete();
      return true;
    }
    return false;
  }

  moveIntoBounds(hitObjects: HitObject[], positions: Vec2[]): Vec2[] {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (let i = 0; i < hitObjects.length; i++) {
      const hitObject = hitObjects[i];
      const position = positions[i];

      minX = Math.min(minX, position.x);
      minY = Math.min(minY, position.y);
      maxX = Math.max(maxX, position.x);
      maxY = Math.max(maxY, position.y);

      if (hitObject instanceof Slider) {
        const endPosition = position.add(hitObject.path.endPosition);

        minX = Math.min(minX, endPosition.x);
        minY = Math.min(minY, endPosition.y);
        maxX = Math.max(maxX, endPosition.x);
        maxY = Math.max(maxY, endPosition.y);
      }
    }

    const offset = new Vec2(0, 0);
    let constrainX = false;

    if (minX < 0 && maxX <= 512) {
      offset.x = -minX;
    }
    else if (maxX > 512 && minX >= 0) {
      offset.x = 512 - maxX;
    }
    else if (minX < 0 && maxX > 512) {
      constrainX = true;
    }

    let constrainY = false;

    if (minY < 0 && maxY <= 384) {
      offset.y = -minY;
    }
    else if (maxY > 384 && minY >= 0) {
      offset.y = 384 - maxY;
    }
    else if (minY < 0 && maxY > 384) {
      constrainY = true;
    }

    if (offset.x === 0 && offset.y === 0 && !constrainX && !constrainY) {
      return positions;
    }

    return positions.map((it, index) => {
      const position = it.add(offset);

      if (constrainX) {
        position.x = this.#startPositions[index]!.x;
      }

      if (constrainY) {
        position.y = this.#startPositions[index]!.y;
      }

      return position;
    });
  }
}
