import {EditorInstance} from "../editorClient.ts";
import {EditorCommand} from "@osucad/common";

export function deleteObjectsInteraction(editor: EditorInstance) {
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