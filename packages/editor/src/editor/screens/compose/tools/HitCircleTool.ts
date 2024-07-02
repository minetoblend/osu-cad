import {
  CreateHitObjectCommand,
  DeleteHitObjectCommand,
  HitCircle,
} from '@osucad/common';
import { ComposeTool } from './ComposeTool';
import {
  MouseDownEvent,
  MouseMoveEvent,
  dependencyLoader,
} from 'osucad-framework';

export class HitCircleTool extends ComposeTool {
  constructor() {
    super();
  }

  #previewCircle!: HitCircle;

  @dependencyLoader()
  load() {
    this.editorClock.currentTimeBindable.addOnChangeListener(() => {
      if (this.#previewCircle) {
        this.#previewCircle.startTime = this.editorClock.currentTime;
      }
    });
  }

  update(): void {
    super.update();

    if (!this.#previewCircle) {
      this.#beginPlacing();
    }
  }

  #beginPlacing() {
    const circle = new HitCircle();
    circle.position = this.mousePosition;
    circle.startTime = this.editorClock.currentTime;

    this.hitObjects.add(circle);

    this.#previewCircle = circle;
  }

  onMouseMove(e: MouseMoveEvent): boolean {
    this.#previewCircle.position = e.mousePosition;

    return true;
  }

  onMouseDown(e: MouseDownEvent): boolean {
    if (e.button === 0) {
      const circle = this.#previewCircle;
      const placementTime = this.editorClock.currentTime;

      this.hitObjects.remove(circle);

      let existing = this.hitObjects.getAtTime(placementTime);

      while (existing) {
        this.submit(new DeleteHitObjectCommand(existing), false);
        existing = this.hitObjects.getAtTime(placementTime);
      }

      circle.startTime = placementTime;

      this.submit(new CreateHitObjectCommand(circle));

      this.#beginPlacing();

      return true;
    }
    return false;
  }

  dispose(): boolean {
    this.hitObjects.remove(this.#previewCircle);

    return true;
  }
}
