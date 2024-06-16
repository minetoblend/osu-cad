import { UndoableInteraction } from './UndoableInteraction.ts';
import { ComposeTool } from '../ComposeTool.ts';
import { HitObject, Rect, Slider, updateHitObject, Vec2 } from '@osucad/common';
import { FederatedPointerEvent } from 'pixi.js';
import {
  getHitObjectPositions,
  HitObjectSnapProvider,
} from '../snapping/HitObjectSnapProvider.ts';

export class MoveHitObjectsInteraction extends UndoableInteraction {
  constructor(
    tool: ComposeTool,
    private readonly hitObjects: HitObject[],
  ) {
    super(tool);
    if (hitObjects.length === 0) this.complete();

    this.addChild(this.snapping.visualizer);
  }

  private snapping = new HitObjectSnapProvider(this.tool);
  private previousSnapOffset = new Vec2();
  private moveOutsideOffset = new Vec2();

  onMouseUp(event: FederatedPointerEvent) {
    if (event.button === 0) this.complete();
  }

  onDrag(event: FederatedPointerEvent) {
    let movement = Vec2.from(
      this.toLocal(Vec2.add(event.movement, this.getGlobalPosition())),
    );

    movement = Vec2.add(movement, this.moveOutsideOffset);

    let positions = getHitObjectPositions(this.hitObjects);
    if (this.previousSnapOffset) {
      positions = positions.map((it) =>
        Vec2.add(movement, Vec2.sub(it, this.previousSnapOffset!)),
      );
      movement = Vec2.sub(movement, this.previousSnapOffset);
      this.previousSnapOffset = new Vec2();
    }

    const snapResult = this.snapping.snap(positions).pop();

    if (snapResult) {
      movement = Vec2.add(movement, snapResult.offset);
      this.previousSnapOffset = snapResult.offset;
    }
    const firstPosition = this.hitObjects[0].position;
    const bounds = new Rect(firstPosition.x, firstPosition.y, 0, 0);
    this.selection.selectedObjects.forEach((hitObject) => {
      bounds.addPoint(hitObject.position);
      if (hitObject instanceof Slider) {
        bounds.addPoint(
          Vec2.add(hitObject.position, hitObject.path.endPosition),
        );
      }
    });

    bounds.translate(movement);

    this.moveOutsideOffset = new Vec2();
    if (bounds.x < 0) {
      this.moveOutsideOffset.x = bounds.x;
    } else if (bounds.x + bounds.width > 512) {
      this.moveOutsideOffset.x = bounds.x + bounds.width - 512;
    }
    if (bounds.y < 0) {
      this.moveOutsideOffset.y = bounds.y;
    } else if (bounds.y + bounds.height > 384) {
      this.moveOutsideOffset.y = bounds.y + bounds.height - 384;
    }
    movement = Vec2.sub(movement, this.moveOutsideOffset);

    this.selection.selectedObjects.forEach((hitObject) => {
      this.commandManager.submit(
        updateHitObject(hitObject, {
          position: Vec2.add(hitObject.position, movement),
        }),
      );
    });
  }
}
