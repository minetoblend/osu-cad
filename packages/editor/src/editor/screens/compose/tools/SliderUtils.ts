import type { PathPoint, Slider, SliderSelection } from '@osucad/common';
import type { CommandManager } from '../../../context/CommandManager';
import type { EditorSelection } from '../EditorSelection';
import type { DistanceSnapProvider } from './DistanceSnapProvider';
import { DeleteHitObjectCommand, PathType, SliderSelectionType, UpdateHitObjectCommand } from '@osucad/common';
import { Vec2 } from 'osucad-framework';

export class SliderUtils {
  constructor(
    readonly commandManager: CommandManager,
    readonly snapProvider: DistanceSnapProvider,
  ) {
  }

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
      this.commandManager.submit(new DeleteHitObjectCommand(slider), commit);
      return false;
    }

    let position: Vec2 | undefined;

    if (index === 0) {
      path[1] = path[1].withType(path[1].type ?? path[0].type);

      position = slider.position.add(path[1]);

      for (let i = path.length - 1; i >= 1; i--) {
        path[i] = path[i].moveBy(path[1].position.scale(-1));
      }
    }

    path.splice(index, 1);

    if (position) {
      this.commandManager.submit(
        new UpdateHitObjectCommand(slider, {
          position,
        }),
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
        path[i] = path[i].moveBy(delta.scale(-1));
      }

      const originalPath = slider.path.controlPoints;

      slider.path.controlPoints = path;
      slider.path.invalidate();

      const expectedDistance = this.snapSlider(slider);

      slider.path.controlPoints = originalPath;

      this.commandManager.submit(
        new UpdateHitObjectCommand(slider, {
          position,
          controlPoints: path,
          expectedDistance,
        }),
        false,
      );
    }
    else {
      const path = [...slider.path.controlPoints];

      path[index] = path[index].withPosition(position.sub(slider.stackedPosition));

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
    path[index] = path[index].withType(type);

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
        newType = PathType.Catmull;
        break;
      case PathType.Catmull:
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

  setPath(slider: Slider, path: PathPoint[], commit = false) {
    const originalPath = slider.path.controlPoints;

    slider.path.controlPoints = path;
    slider.path.invalidate();

    const expectedDistance = this.snapSlider(slider);

    slider.path.controlPoints = originalPath;

    this.commandManager.submit(
      new UpdateHitObjectCommand(slider, {
        controlPoints: path,
        expectedDistance,
      }),
      commit,
    );
  }

  snapSlider(slider: Slider): number {
    return (
      this.snapProvider.findSnappedDistance(
        slider,
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
      if (distance < 100) {
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

    return { position: closest, distance: closestDistance };
  }

  static toggleEdge(selection: EditorSelection, subSelection: SliderSelection, index: number) {
    const edges = new Set(subSelection.selectedEdges);

    if (!edges.delete(index)) {
      edges.add(index);
    }

    selection.setSliderSelection(subSelection.slider, SliderSelectionType.Custom, [...edges]);
  }

  static calculateEdges(currentEdges: Set<number>, newEdges: Set<number>, add: boolean) {
    if (newEdges.size > 0) {
      if (add) {
        if ([...newEdges].every(it => currentEdges.has(it))) {
          const combinedEdges = new Set(currentEdges);
          for (const edge of newEdges) {
            combinedEdges.delete(edge);
          }

          return [...combinedEdges];
        }

        for (const edge of currentEdges)
          newEdges.add(edge);
      }
    }

    return [...newEdges];
  }
}

export interface SliderInsertPoint {
  position: Vec2;
  index: number;
}
