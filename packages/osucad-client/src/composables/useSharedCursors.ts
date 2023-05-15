import { watchThrottled } from "@vueuse/core";
import { useEditor } from "@/editor/createEditor";
import { Vec2 } from "@osucad/common";
import { Ref, onScopeDispose, reactive } from "vue";
import { IClient } from "@osucad/unison";

export function useSharedCursors(
  id: string,
  cursorPos: Readonly<Ref<Vec2 | undefined>>
) {
  const { container } = useEditor()!;
  const signals = container.signals;

  const topic = "cursorPos:" + id;

  const cursors = reactive(new Map<number, Vec2>());

  watchThrottled(
    cursorPos,
    (cursorPos) => {
      if (!cursorPos) {
        signals.emit(topic, undefined);
        return;
      }
      signals.emit(topic, cursorPos);
    },
    { throttle: 50 }
  );

  function onCursorPosUpdate(data: any, message: any) {
    if (message.clientId === container.connection.id) return;

    const pos = data as Vec2 | undefined;
    if (pos) {
      cursors.set(message.clientId, pos);
    } else {
      cursors.delete(message.clientId);
    }
  }

  container.users.on("userLeft", onUserLeft);

  function onUserLeft(client: IClient) {
    cursors.delete(client.clientId);
  }

  signals.on(topic, onCursorPosUpdate);

  onScopeDispose(() => {
    signals.off(topic, onCursorPosUpdate);
    container.users.off("userLeft", onUserLeft);
  });

  return cursors;
}
