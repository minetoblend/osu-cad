import {EditorCommand} from "@osucad/common";
import {EditorContext} from "@/editor/editorContext.ts";

export function deleteObjectsInteraction(editor: EditorContext) {
  useEventListener("keydown", (e) => {
    if (e.key === "Delete") {
      const selectedObjects = [...editor.selection.selectedObjects];
      if (selectedObjects.length > 0) {
        for (const hitObject of selectedObjects) {
          editor.commandManager.submit(EditorCommand.deleteHitObject({ id: hitObject.id }));
        }
        editor.commandManager.commit();
      }
    }
  });
}