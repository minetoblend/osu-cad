import { ToolInteraction } from './ToolInteraction.ts';
import { ComposeTool } from '../ComposeTool.ts';
import { Vec2 } from '@osucad/common';
import { FederatedPointerEvent, Graphics } from 'pixi.js';
import { Inject } from '../../drawables/di';
import { AxisContainer, AxisDrawable } from '../../AxisContainer.ts';

export class InsertAxisInteraction extends ToolInteraction {
  startPos?: Vec2;
  endPos?: Vec2;

  private visualizer = new Graphics();

  @Inject(AxisContainer)
  private axisContainer!: AxisContainer;

  constructor(tool: ComposeTool) {
    super(tool);
    this.addChild(this.visualizer);
  }

  onMouseDown(event: FederatedPointerEvent) {
    if (event.button === 0) {
      if (!this.startPos) {
        this.startPos = this.mousePos;
      } else {
        console.log('end');
        this.endPos = this.mousePos;
        this.axisContainer.addChild(
          new AxisDrawable(this.startPos, this.endPos),
        );
        this.complete();
      }
    }
  }

  onTick() {
    const g = this.visualizer;

    g.clear()
      .moveTo(-10000, this.mousePos.y)
      .lineTo(10000, this.mousePos.y)
      .moveTo(this.mousePos.x, -10000)
      .lineTo(this.mousePos.x, 10000)
      .stroke({ color: 0xffffff, alpha: 0.4 });

    if (this.startPos) {
      const angle = Math.atan2(
        this.mousePos.y - this.startPos.y,
        this.mousePos.x - this.startPos.x,
      );
      const start = this.startPos.add(new Vec2(10000, 0).rotate(angle));
      const end = this.startPos.add(new Vec2(-10000, 0).rotate(angle));
      g.moveTo(start.x, start.y)
        .lineTo(end.x, end.y)
        .stroke({ color: 0xffffff, alpha: 1.0 });
    }
  }
}
