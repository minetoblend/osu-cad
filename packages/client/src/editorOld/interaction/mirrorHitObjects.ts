import {
  HitObject,
  IVec2,
  Rect,
  SerializedHitObject,
  SerializedSlider,
  Slider,
  updateHitObject,
  Vec2,
} from '@osucad/common';
import { getHitObjectPositions } from '../tools/snapping/HitObjectSnapProvider.ts';
import { EditorContext } from '@/editorOld/editorContext.ts';
import { onEditorKeyDown } from '@/composables/onEditorKeyDown.ts';

export function mirrorHitObjects(
  editor: EditorContext,
  axis: 'horizontal' | 'vertical',
  bounds: Rect,
) {
  if (axis === 'horizontal') {
    editor.selection.selectedObjects.forEach((hitObject) => {
      const update: Partial<SerializedHitObject & SerializedSlider> = {
        position: {
          x: bounds.left + bounds.right - hitObject.position.x,
          y: hitObject.position.y,
        },
      };

      if (hitObject instanceof Slider) {
        update.path = hitObject.path.controlPoints.map((point) => ({
          ...point,
          x: -point.x,
        }));
      }
      editor.commandManager.submit(updateHitObject(hitObject, update));
    });
    editor.commandManager.commit();
  }
  if (axis === 'vertical') {
    editor.selection.selectedObjects.forEach((hitObject) => {
      const update: Partial<SerializedHitObject & SerializedSlider> = {
        position: {
          x: hitObject.position.x,
          y: bounds.top + bounds.bottom - hitObject.position.y,
        },
      };

      if (hitObject instanceof Slider) {
        update.path = hitObject.path.controlPoints.map((point) => ({
          ...point,
          y: -point.y,
        }));
      }
      editor.commandManager.submit(updateHitObject(hitObject, update));
    });
    editor.commandManager.commit();
  }
}

export function transformHitObjectsInteraction(editor: EditorContext) {
  onEditorKeyDown((evt, shortcut) => {
    if (shortcut?.startsWith('hitobject.flip-horizontal')) {
      evt.preventDefault();
      if (editor.selection.size === 0) return;

      const bounds = evt.shiftKey
        ? Rect.containingPoints(
            getHitObjectPositions([...editor.selection.selectedObjects]),
          )!
        : new Rect(0, 0, 512, 384);
      mirrorHitObjects(editor, 'horizontal', bounds);
    } else if (shortcut?.startsWith('hitobject.flip-vertical')) {
      evt.preventDefault();

      if (editor.selection.size === 0) return;

      const bounds = evt.shiftKey
        ? Rect.containingPoints(
            getHitObjectPositions([...editor.selection.selectedObjects]),
          )!
        : new Rect(0, 0, 512, 384);

      mirrorHitObjects(editor, 'vertical', bounds);
    } else if (shortcut === 'hitobject.rotate-clockwise') {
      evt.preventDefault();
      const hitObjects = [...editor.selection.selectedObjects];
      rotateHitObjects(editor, hitObjects, Math.PI / 2, evt.shiftKey);
      editor.commandManager.commit();
    } else if (shortcut === 'hitobject.rotate-counter-clockwise') {
      evt.preventDefault();
      const hitObjects = [...editor.selection.selectedObjects];
      rotateHitObjects(editor, hitObjects, -Math.PI / 2, evt.shiftKey);
      editor.commandManager.commit();
    } else if (evt.ctrlKey && evt.code.startsWith('Arrow')) {
      evt.preventDefault();
      evt.stopImmediatePropagation();
      const hitObjects = [...editor.selection.selectedObjects];
      moveHitObjects(hitObjects, {
        x: evt.code === 'ArrowLeft' ? -1 : evt.code === 'ArrowRight' ? 1 : 0,
        y: evt.code === 'ArrowUp' ? -1 : evt.code === 'ArrowDown' ? 1 : 0,
      });
      editor.commandManager.commit();
    }
  });

  function moveHitObjects(hitObjects: HitObject[], delta: IVec2) {
    if (hitObjects.length === 0) return;
    const bounds = Rect.containingPoints(getHitObjectPositions(hitObjects))!;

    if (bounds.x + delta.x < 0) delta.x = -bounds.x;
    if (bounds.y + delta.y < 0) delta.y = -bounds.y;
    if (bounds.x + bounds.width + delta.x > 512)
      delta.x = 512 - bounds.x - bounds.width;
    if (bounds.y + bounds.height + delta.y > 384)
      delta.y = 384 - bounds.y - bounds.height;

    for (const hitObject of hitObjects) {
      editor.commandManager.submit(
        updateHitObject(hitObject, {
          position: hitObject.position.add(delta),
        }),
      );
    }
  }
}

export function rotateHitObjects(
  editor: EditorContext,
  hitObjects: HitObject[],
  angle: number,
  aroundCenter: boolean | Vec2,
) {
  if (hitObjects.length === 0) return;

  const bounds = Rect.containingPoints(getHitObjectPositions(hitObjects))!;

  const center =
    aroundCenter instanceof Vec2
      ? aroundCenter
      : aroundCenter
        ? bounds.center
        : new Vec2(256, 192);

  for (const hitObject of hitObjects) {
    const newPosition = hitObject.position
      .sub(center)
      .rotate(angle)
      .add(center);

    if (hitObject instanceof Slider) {
      editor.commandManager.submit(
        updateHitObject(hitObject, {
          position: newPosition,
          path: hitObject.path.controlPoints.map((point) => ({
            ...point,
            ...Vec2.from(point).rotate(angle),
          })),
        }),
      );
    } else
      editor.commandManager.submit(
        updateHitObject(hitObject, {
          position: newPosition,
        }),
      );
  }
}
