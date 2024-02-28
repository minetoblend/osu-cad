import {
  EditorCommand,
  HitObject,
  hitObjectId,
  SerializedHitObject,
} from '@osucad/common';
import { EditorContext } from '@/editor/editorContext.ts';

export function copyPasteInteractions(editor: EditorContext) {
  function copyTimestamp(e: ClipboardEvent, hitObjects: HitObject[]) {
    const time = hitObjects[0]?.startTime ?? editor.clock.currentTime;
    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    const milliseconds = Math.floor(time % 1000);

    const timestamp = [
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0'),
      milliseconds.toString().padStart(3, '0'),
    ].join(':');

    let comboInfo = '';

    if (hitObjects.length > 0) {
      const comboNumbers = hitObjects.map((it) => it.indexInCombo + 1);
      comboInfo = ` (${comboNumbers.join(',')})`;
    }

    e.clipboardData!.setData('text/plain', `${timestamp}${comboInfo} - `);
  }

  useEventListener('copy', (e) => {
    if (shouldIgnore(e)) return;

    const hitObjects = editor.beatmapManager.hitObjects.hitObjects.filter(
      (it) => it.isSelected,
    );

    hitObjects.sort((a, b) => a.startTime - b.startTime);

    e.clipboardData!.setData(
      'osucad/hitobjects',
      JSON.stringify(hitObjects.map((it) => it.serialize())),
    );

    copyTimestamp(e, hitObjects);

    e.preventDefault();
  });

  useEventListener('cut', (e) => {
    if (shouldIgnore(e)) return;

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

    copyTimestamp(e, hitObjects);

    e.preventDefault();
  });

  useEventListener('paste', (e) => {
    if (shouldIgnore(e)) return;

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

function shouldIgnore(event: ClipboardEvent): boolean {
  if (
    event.target instanceof HTMLInputElement ||
    event.target instanceof HTMLTextAreaElement
  ) {
    return true;
  }
  if (document.querySelector('.q-dialog')) return true;

  return false;
}
