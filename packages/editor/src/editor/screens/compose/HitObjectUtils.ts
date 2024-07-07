import {
  HitObject,
  SerializedSlider,
  Slider,
  Spinner,
  UpdateHitObjectCommand,
} from '@osucad/common';
import {
  Axes,
  CompositeDrawable,
  dependencyLoader,
  Rectangle,
  resolved,
  Vec2,
} from 'osucad-framework';
import { Matrix } from 'pixi.js';
import { DistanceSnapProvider } from './tools/DistanceSnapProvider';
import { CommandManager } from '../../context/CommandManager';

export class HitObjectUtils extends CompositeDrawable {
  constructor() {
    super();
  }

  @resolved(CommandManager)
  commandManager!: CommandManager;

  snapProvider!: DistanceSnapProvider;

  @dependencyLoader()
  load() {
    this.snapProvider = new DistanceSnapProvider();
    this.addInternal(this.snapProvider);
  }

  mirrorHitObjects(
    axis: Axes,
    hitObjects: HitObject[],
    aroundCenter: boolean = false,
    commit: boolean = true,
  ) {
    if (hitObjects.length === 0) return;

    const center = aroundCenter
      ? this.getBounds(hitObjects).center
      : new Vec2(512 / 2, 384 / 2);

    switch (axis) {
      case Axes.X:
        this.transformHitObjects(
          new Matrix()
            .translate(-center.x, -center.y)
            .scale(-1, 1)
            .translate(center.x, center.y),
          hitObjects,
          commit,
        );

        break;
      case Axes.Y:
        this.transformHitObjects(
          new Matrix()
            .translate(-center.x, -center.y)
            .scale(1, -1)
            .translate(center.x, center.y),
          hitObjects,
          commit,
        );

        break;
    }
  }

  getBounds(hitObjects: HitObject[]) {
    let minX = Number.MAX_VALUE;
    let minY = Number.MAX_VALUE;
    let maxX = Number.MIN_VALUE;
    let maxY = Number.MIN_VALUE;

    for (const hitObject of hitObjects) {
      if (hitObject instanceof Spinner) {
        continue;
      }

      minX = Math.min(minX, hitObject.position.x);
      minY = Math.min(minY, hitObject.position.y);
      maxX = Math.max(maxX, hitObject.position.x);
      maxY = Math.max(maxY, hitObject.position.y);

      if (hitObject instanceof Slider) {
        minX = Math.min(minX, hitObject.endPosition.x);
        minY = Math.min(minY, hitObject.endPosition.y);
        maxX = Math.max(maxX, hitObject.endPosition.x);
        maxY = Math.max(maxY, hitObject.endPosition.y);
      }
    }

    return new Rectangle(minX, minY, maxX - minX, maxY - minY);
  }

  transformHitObjects(
    transform: Matrix,
    hitObjects: HitObject[],
    commit: boolean = true,
  ) {
    for (let i = 0; i < hitObjects.length; i++) {
      this.transformHitObject(
        transform,
        hitObjects[i],
        commit && i === hitObjects.length - 1,
      );
    }
  }

  transformHitObject(
    transform: Matrix,
    hitObject: HitObject,
    commit: boolean = true,
  ) {
    const position = hitObject.position;
    const newPosition = Vec2.from(transform.apply(position));

    if (hitObject instanceof Slider) {
      const pointTransform = transform
        .clone()
        .translate(-transform.tx, -transform.ty);

      const path = hitObject.path.controlPoints.map((p) => {
        return {
          ...Vec2.from(pointTransform.apply(p)),
          type: p.type,
        };
      });

      this.commandManager.submit(
        new UpdateHitObjectCommand(hitObject, {
          position: newPosition,
          path,
        } as Partial<SerializedSlider>),
        commit,
      );

      const expectedDistance = this.snapProvider.findSnappedDistance(
        hitObject,
        hitObject.path.calculatedDistance,
      );
    }

    this.commandManager.submit(
      new UpdateHitObjectCommand(hitObject, {
        position: newPosition,
      }),
      commit,
    );
  }
}
