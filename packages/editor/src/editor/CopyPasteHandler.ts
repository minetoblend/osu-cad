import type { IKeyBindingHandler, KeyBindingPressEvent } from 'osucad-framework';
import { CompositeDrawable, PlatformAction, resolved } from 'osucad-framework';
import type { HitObject, SerializedHitObject } from '@osucad/common';
import { CreateHitObjectCommand, DeleteHitObjectCommand, deserializeHitObject, hitObjectId } from '@osucad/common';
import { EditorSelection } from './screens/compose/EditorSelection';
import { CommandManager } from './context/CommandManager';
import { EditorClock } from './EditorClock';

const hitObjectMimeType = 'web x-osucad/hitobjects+json';

export class HitObjectClipboard extends CompositeDrawable implements IKeyBindingHandler<PlatformAction> {
  @resolved(EditorSelection)
  selection!: EditorSelection;

  @resolved(CommandManager)
  commandManager!: CommandManager;

  @resolved(EditorClock)
  editorClock!: EditorClock;

  #serializeSelection() {
    return this.selection.selectedObjects
      .sort((a, b) => b.startTime - a.startTime)
      .map(it => it.serialize());
  }

  #formatTimestamp() {
    const time = Math.floor(this.editorClock.currentTime);

    const minutes = Math.floor(time / 60_000);
    const seconds = Math.floor(time / 1000) % 60;
    const millis = Math.floor(time % 1000);

    let timestamp = [
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0'),
      millis.toString().padStart(3, '0'),
    ].join(':');

    if (this.selection.length > 0) {
      const comboNumbers = this.selection.selectedObjects.map(it => it.indexInCombo + 1).join(',');

      timestamp += ` (${comboNumbers})`;
    }

    timestamp += ' - ';

    return timestamp;
  }

  async copy() {
    const hitObjectsJson = JSON.stringify(this.#serializeSelection());

    const hitObjectsBlob = new Blob([hitObjectsJson], { type: hitObjectMimeType });

    const textBlob = new Blob([this.#formatTimestamp()], { type: 'text/plain' });

    const data = [
      new ClipboardItem({
        [hitObjectMimeType]: hitObjectsBlob,
        'text/plain': textBlob,
      }),
    ];

    await navigator.clipboard.write(data);
  }

  async cut() {
    this.copy();
    for (const h of [...this.selection.selectedObjects]) {
      this.commandManager.submit(new DeleteHitObjectCommand(h), false);
    }
    this.commandManager.commit();
  }

  async paste() {
    const items = await navigator.clipboard.read();
    for (const item of items) {
      if (item.types.includes(hitObjectMimeType)) {
        try {
          const content = await item.getType(hitObjectMimeType);
          const textContent = await content.text();

          const parsed = JSON.parse(textContent) as SerializedHitObject[];

          const hitObjects = parsed.map(it => deserializeHitObject(it))
            .sort((b, a) => b.startTime - a.startTime);

          if (hitObjects.length === 0)
            return;

          const startTime = hitObjects[0].startTime;

          const created: HitObject[] = [];

          for (const h of hitObjects) {
            h.id = hitObjectId();
            const offset = h.startTime - startTime;
            h.startTime = this.editorClock.currentTime + offset;

            created.push(
              this.commandManager.submit(
                new CreateHitObjectCommand(h.serialize()),
                false,
              )!,
            );
          }

          this.commandManager.commit();

          this.selection.select(created);
        }
        catch (e) {
          // TODO: show error toast & Sentry.captureException
        }
      }
    }
  }

  readonly isKeyBindingHandler = true;

  canHandleKeyBinding(binding: PlatformAction): boolean {
    return binding instanceof PlatformAction;
  }

  onKeyBindingPressed(e: KeyBindingPressEvent<PlatformAction>): boolean {
    switch (e.pressed) {
      case PlatformAction.Cut:
        this.cut();
        return true;
      case PlatformAction.Copy:
        this.copy();
        return true;
      case PlatformAction.Paste:
        this.paste();
        return true;
    }

    return false;
  }
}
