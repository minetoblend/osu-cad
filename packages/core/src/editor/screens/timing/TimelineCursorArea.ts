import type { Vec2 } from '@osucad/framework';
import { resolved } from '@osucad/framework';
import { MultiplayerCursorArea } from '../../multiplayer/MultiplayerCursorArea';
import { Timeline } from '../../ui/timeline/Timeline';

export class TimelineCursorArea extends MultiplayerCursorArea {
  constructor(key: string, useProxy: boolean = true) {
    super(key, useProxy);
  }

  @resolved(Timeline)
  timeline!: Timeline;

  override toLocalCursorPosition(position: Vec2): Vec2 {
    const localPos = this.toLocalSpace(position);

    localPos.x /= this.timeline.content.width;

    return localPos;
  }

  override toScreenSpaceCursorPosition(position: Vec2): Vec2 {
    position = position.mul({
      x: this.timeline.content.width,
      y: 1,
    });

    return this.toScreenSpace(position);
  }
}
