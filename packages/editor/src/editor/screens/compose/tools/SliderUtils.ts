import { CommandManager } from '../../../context/CommandManager';
import {
  IDistanceSnapProvider,
  SerializedSlider,
  Slider,
  UpdateHitObjectCommand,
} from '@osucad/common';
import { Vec2 } from 'osucad-framework';

export class SliderUtils {
  constructor(
    readonly commandManager: CommandManager,
    readonly snapProvider: IDistanceSnapProvider,
  ) {}

  deleteControlPoint(slider: Slider, index: number): boolean {
    console.assert(
      index >= 0 && index < slider.path.controlPoints.length,
      'Invalid index',
    );

    const path = [...slider.path.controlPoints];

    if (path.length <= 2) {
      return false;
    }

    let position: Vec2 | undefined = undefined;

    if (index === 0) {
      path[1].type ??= path[0].type;
      position = slider.position.add(path[1]);

      for (let i = path.length - 1; i >= 1; i--) {
        path[i].x -= path[1].x;
        path[i].y -= path[1].y;
      }
    }

    path.splice(index, 1);

    const originalPath = slider.path.controlPoints;

    slider.path.controlPoints = [...path];
    slider.path.invalidate();

    const expectedDistance = this.snapSlider(slider);

    slider.path.controlPoints = originalPath;

    this.commandManager.submit(
      new UpdateHitObjectCommand(slider, {
        position,
        path,
        expectedDistance,
      } as Partial<SerializedSlider>),
    );

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
    } else {
      const path = [...slider.path.controlPoints];

      path[index] = {
        x: position.x - slider.stackedPosition.x,
        y: position.y - slider.stackedPosition.y,
        type: path[index].type,
      };

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
  }

  snapSlider(slider: Slider): number {
    return (
      this.snapProvider?.findSnappedDistance(
        slider,
        slider.path.calculatedDistance,
      ) ?? slider.path.calculatedDistance
    );
  }
}
