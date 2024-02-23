import { ComposeTool } from './ComposeTool.ts';
import {
  EditorCommand,
  HitCircle,
  hitObjectId,
  updateHitObject,
  Vec2,
} from '@osucad/common';
import { DestroyOptions, FederatedPointerEvent } from 'pixi.js';
import { HitObjectSnapProvider } from './snapping/HitObjectSnapProvider.ts';
import { Inject } from '../drawables/di';
import { ToolContainer } from './ToolContainer.ts';
import { isMobile } from '@/util/isMobile.ts';

export class HitCircleTool extends ComposeTool {
  private currentObject!: HitCircle;
  private snapping = new HitObjectSnapProvider(this);

  onLoad() {
    super.onLoad();
    this.currentObject = new HitCircle();
    this.currentObject.startTime = this.editor.clock.currentTime;
    this.currentObject.position = this.mousePos;
    if (!isMobile())
      this.editor.beatmapManager.hitObjects.add(this.currentObject);
    this.selection.clear();
    this.on('rightdown', this.onRightDown, this);

    this.onTick();
  }

  private isCreating = false;

  destroy(options?: DestroyOptions) {
    super.destroy(options);
    this.editor.beatmapManager.hitObjects.remove(this.currentObject);
    if (this.isCreating) this.editor.commandManager.commit();
  }

  onTick() {
    super.onTick();
    if (this.mousePos) {
      let position = this.mousePos;

      const result = this.snapping.snap([position], [this.currentObject]).pop();
      if (result) position = Vec2.add(position, result.offset);

      if (position.x < 0) position.x = 0;
      if (position.x > 512) position.x = 512;
      if (position.y < 0) position.y = 0;
      if (position.y > 384) position.y = 384;
      this.currentObject.position = position;
    }
    if (!this.isCreating)
      this.currentObject.startTime = this.beatInfo.snap(
        this.editor.clock.currentTimeAnimated,
      );
  }

  protected onMouseDown(evt: FederatedPointerEvent) {
    if (evt.button === 0) {
      this.editor.beatmapManager.hitObjects.remove(this.currentObject);

      const id = hitObjectId();

      const objectsAtTime =
        this.editor.beatmapManager.hitObjects.hitObjects.filter(
          (it) => Math.abs(it.startTime - this.currentObject.startTime) < 0.5,
        );
      for (const object of objectsAtTime) {
        this.submit(
          EditorCommand.deleteHitObject({
            id: object.id,
          }),
        );
      }

      this.submit(
        EditorCommand.createHitObject({
          hitObject: {
            ...this.currentObject.serialize(),
            id,
          },
        }),
      );

      this.currentObject = this.editor.beatmapManager.hitObjects.getById(
        id,
      ) as HitCircle;
      this.isCreating = true;
    }
  }

  protected onMouseUp(evt: FederatedPointerEvent) {
    if (evt.button === 0 && this.isCreating) {
      this.editor.commandManager.commit();
      this.currentObject = new HitCircle();
      if (!isMobile())
        this.editor.beatmapManager.hitObjects.add(this.currentObject);
      this.isCreating = false;
    }
  }

  private onRightDown(evt: FederatedPointerEvent) {
    evt.preventDefault();

    const object = this.getClosestToClock(
      this.hoveredHitObjects.filter((o) => o !== this.currentObject),
    );
    if (object) {
      this.submit(
        EditorCommand.deleteHitObject({
          id: object.id,
        }),
        true,
      );
    } else {
      this.currentObject.isNewCombo = !this.currentObject.isNewCombo;
    }
  }

  @Inject(ToolContainer)
  toolContainer!: ToolContainer;

  protected onKeyDown(evt: KeyboardEvent, shortcut: string) {
    super.onKeyDown(evt, shortcut);
    switch (evt.key) {
      case 'q':
        if (this.isCreating)
          this.submit(
            updateHitObject(this.currentObject, {
              newCombo: !this.currentObject.isNewCombo,
            }),
          );
        else this.currentObject.isNewCombo = !this.currentObject.isNewCombo;
        break;
    }
  }
}
