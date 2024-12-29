import type { Drawable, IKeyBindingHandler, KeyBindingAction, KeyBindingPressEvent, Vec2 } from 'osucad-framework';
import type { OsuHitObject } from '../hitObjects/OsuHitObject';
import { EditorAction } from '@osucad/editor/editor/EditorAction';
import { Direction, PlatformAction, resolved } from 'osucad-framework';
import { DrawableComposeTool } from '../../../editor/screens/compose/DrawableComposeTool';
import { getIcon } from '../../../OsucadIcons';
import { PathType } from '../hitObjects/PathType';
import { MobileControlButton } from './MobileEditorControls';
import { OsuHitObjectComposer } from './OsuHitObjectComposer';

export class DrawableOsuSelectTool extends DrawableComposeTool implements IKeyBindingHandler<PlatformAction | EditorAction> {
  @resolved(() => OsuHitObjectComposer)
  composer!: OsuHitObjectComposer;

  override createMobileControls(): Drawable[] {
    return [
      new MobileControlButton(getIcon('size-ew'), () => {
        this.composer.mirrorHitObjects([...this.selection.selectedObjects], Direction.Horizontal);
        this.commit();
      }),
      new MobileControlButton(getIcon('size-ns'), () => {
        this.composer.mirrorHitObjects([...this.selection.selectedObjects], Direction.Vertical);
        this.commit();
      }),
    ];
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
}
