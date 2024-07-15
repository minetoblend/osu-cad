import type {
  IDistanceSnapProvider,
  SerializedPathPoint,
  SerializedSlider,
  Slider,
} from '@osucad/common';
import {
  PathType,
  UpdateHitObjectCommand,
} from '@osucad/common';
import { Vec2 } from 'osucad-framework';
import type { CommandManager } from '../../../context/CommandManager';

export class SliderUtils {
  constructor(
    readonly commandManager: CommandManager,
    readonly snapProvider: IDistanceSnapProvider,
  ) {}

  deleteControlPoint(
    slider: Slider,
    index: number,
    commit: boolean = true,
  ): boolean {
    console.assert(
      index >= 0 && index < slider.path.controlPoints.length,
      'Invalid index',
    );

    const path = [...slider.path.controlPoints];

    if (path.length <= 2) {
      return false;
    }

    let position: Vec2 | undefined;

    if (index === 0) {
      path[1].type ??= path[0].type;
      position = slider.position.add(path[1]);

      for (let i = path.length - 1; i >= 1; i--) {
        path[i].x -= path[1].x;
        path[i].y -= path[1].y;
      }
    }

    path.splice(index, 1);

    if (position) {
      this.commandManager.submit(
        new UpdateHitObjectCommand(slider, {
          position,
        } as Partial<SerializedSlider>),
        false,
      );
    }

    this.setPath(slider, path, commit);

    return true;
  }

  moveControlPoint(
    slider: Slider,
    index: number,
    position: Vec2,
    commit = false,
  ) {
    console.assert(!!slider, 'Slider should not be null');

    if (index === 0) {
      const delta = position.sub(slider.stackedPosition);

      const path = [...slider.path.controlPoints];

      for (let i = 1; i < path.length; i++) {
        path[i] = {
          x: path[i].x - delta.x,
          y: path[i].y - delta.y,
          type: path[i].type,
        };
      }

      const originalPath = slider.path.controlPoints;

      slider.path.controlPoints = path;
      slider.path.invalidate();

      const expectedDistance = this.snapSlider(slider);

      slider.path.controlPoints = originalPath;

      this.commandManager.submit(
        new UpdateHitObjectCommand(slider, {
          position,
          path,
          expectedDistance,
        } as Partial<SerializedSlider>),
        false,
      );
    }
    else {
      const path = [...slider.path.controlPoints];

      path[index] = {
        x: position.x - slider.stackedPosition.x,
        y: position.y - slider.stackedPosition.y,
        type: path[index].type,
      };

      this.setPath(slider, path, commit);
    }
  }

  setControlPointType(
    slider: Slider,
    index: number,
    type: PathType | null,
    commit = false,
  ) {
    if (index === 0) {
      console.assert(
        type !== null,
        'Cannot set the type of the first control point to null',
      );
    }

    const path = [...slider.path.controlPoints];
    path[index] = {
      x: path[index].x,
      y: path[index].y,
      type,
    };

    this.setPath(slider, path, commit);
  }

  getNextControlPointType(
    currentType: PathType | null,
    index: number,
  ): PathType | null {
    let newType: PathType | null = null;

    switch (currentType) {
      case null:
        newType = PathType.Bezier;
        break;
      case PathType.Bezier:
        newType = PathType.PerfectCurve;
        break;
      case PathType.PerfectCurve:
        newType = PathType.Linear;
        break;
      case PathType.Linear:
        newType = null;
        break;
    }

    if (index === 0 && newType === null) {
      newType = PathType.Bezier;
    }

    return newType;
  }

  cycleControlPointType(slider: Slider, index: number, commit = false) {
    const currentType = slider.path.controlPoints[index].type;

    const newType = this.getNextControlPointType(currentType, index);

    this.setControlPointType(slider, index, newType, commit);
  }

  setPath(slider: Slider, path: SerializedPathPoint[], commit = false) {
    const originalPath = slider.path.controlPoints;

    slider.path.controlPoints = path;
    slider.path.invalidate();

    const expectedDistance = this.snapSlider(slider);

    slider.path.controlPoints = originalPath;

    this.commandManager.submit(
      new UpdateHitObjectCommand(slider, {
        path,
        expectedDistance,
      } as Partial<SerializedSlider>),
      commit,
    );
  }

  snapSlider(slider: Slider): number {
    return (
      this.snapProvider.findSnappedDistance(
        slider,
        slider.path.calculatedDistance,
      ) ?? slider.path.calculatedDistance
    );
  }

  getInsertPoint(slider: Slider, mousePos: Vec2) {
    if (
      slider.path.controlPoints.some(
        p => mousePos.sub(slider.stackedPosition).distance(p) < 8,
      )
    ) {
      return null;
    }

    let last = slider.path.controlPoints[0];
    let closest: SliderInsertPoint | null = null;
    let closestDistance: number = Infinity;
    for (let i = 1; i < slider.path.controlPoints.length; i++) {
      const current = slider.path.controlPoints[i];

      const A = last;
      const B = current;
      const P = Vec2.sub(mousePos, slider.position);
      const AB = Vec2.sub(B, A);
      const AP = Vec2.sub(P, A);

      const lengthSquaredAB = AB.lengthSq();
      let t = (AP.x * AB.x + AP.y * AB.y) / lengthSquaredAB;
      t = Math.max(0, Math.min(1, t));

      const position = Vec2.add(A, AB.scale(t));

      const distance = position.distance(P);
      if (distance < 35) {
        if (distance < closestDistance) {
          closest = {
            position,
            index: i,
          };
          closestDistance = distance;
        }
      }
      last = current;
    }

    return closest;
  }
}

export interface SliderInsertPoint {
  position: Vec2;
  index: number;
}
