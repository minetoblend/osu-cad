import type { IKeyBindingHandler, KeyBindingAction, KeyBindingPressEvent, Vec2 } from 'osucad-framework';
import type { OsuHitObject } from '../hitObjects/OsuHitObject';
import { EditorAction } from '@osucad/editor/editor/EditorAction';
import { dependencyLoader, PlatformAction } from 'osucad-framework';
import { DrawableComposeTool } from '../../../editor/screens/compose/DrawableComposeTool';

export class DrawableOsuSelectTool extends DrawableComposeTool implements IKeyBindingHandler<PlatformAction | EditorAction> {
  @dependencyLoader()
  [Symbol('load')]() {
    this.addAllInternal(

    );
  }

  override receivePositionalInputAt(screenSpacePosition: Vec2): boolean {
    return true;
  }

  hoveredHitObjects(position: Vec2) {
    return this.playfield.allHitObjects
      .map(it => it.hitObject!)
      .filter(it => it.contains(position)) as OsuHitObject[];
  }

  getSelectionCandidate(hitObjects: OsuHitObject[]) {
    const selected = hitObjects.find(it => this.selection.isSelected(it));
    if (selected)
      return selected;

    let min = Infinity;
    let candidate: OsuHitObject | null = null;

    for (const hitObject of hitObjects) {
      const distance = Math.min(
        Math.abs(hitObject.startTime - this.editorClock.currentTime),
        Math.abs(hitObject.endTime - this.editorClock.currentTime),
      );

      if (distance < min) {
        min = distance;
        candidate = hitObject;
      }
    }

    return candidate;
  }

  readonly isKeyBindingHandler = true;

  canHandleKeyBinding(binding: KeyBindingAction): boolean {
    return binding instanceof PlatformAction || binding instanceof EditorAction;
  }

  onKeyBindingPressed(e: KeyBindingPressEvent<PlatformAction | EditorAction>): boolean {
    if (e.repeat)
      return false;

    switch (e.pressed) {
      case PlatformAction.Delete:
      case PlatformAction.DeleteBackwardChar:
        for (const hitObject of [...this.selection.selectedObjects])
          this.hitObjects.remove(hitObject);
        this.commit();
        return true;
    }

    return false;
  }
}
