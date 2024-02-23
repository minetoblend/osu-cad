import {
  EditorCommand,
  hitObjectId,
  SerializedHitObject,
} from '@osucad/common';
import { EditorContext } from '@/editor/editorContext.ts';

export function copyPasteInteractions(editor: EditorContext) {
  useEventListener('copy', (e) => {
    const hitObjects = editor.beatmapManager.hitObjects.hitObjects.filter(
      (it) => it.isSelected,
    );
    e.clipboardData!.setData(
      'osucad/hitobjects',
      JSON.stringify(hitObjects.map((it) => it.serialize())),
    );
    e.preventDefault();
  });

  useEventListener('cut', (e) => {
    const hitObjects = editor.beatmapManager.hitObjects.hitObjects.filter(
      (it) => it.isSelected,
    );
    e.clipboardData!.setData(
      'osucad/hitobjects',
      JSON.stringify(hitObjects.map((it) => it.serialize())),
    );
    for (const object of hitObjects) {
      editor.commandManager.submit(
        EditorCommand.deleteHitObject({ id: object.id }),
      );
    }
    editor.commandManager.commit();
    e.preventDefault();
  });

  useEventListener('paste', (e) => {
    const data = e.clipboardData!.getData('osucad/hitobjects');
    if (!data) return;

    const hitObjects = JSON.parse(data) as SerializedHitObject[];

    const startTime = hitObjects[0].startTime;

    const ids = hitObjects.map((hitObject) => {
      const id = hitObjectId();
      editor.commandManager.submit(
        EditorCommand.createHitObject({
          hitObject: {
            ...hitObject,
            id,
            startTime:
              hitObject.startTime - startTime + editor.clock.currentTime,
          },
        }),
      );
      return id;
    });

    const createdHitObjects = ids
      .map((id) => editor.beatmapManager.hitObjects.getById(id)!)
      .filter((it) => !!it);

    editor.commandManager.commit();
    editor.selection.clear();
    editor.selection.selectAll(createdHitObjects);
  });
}
