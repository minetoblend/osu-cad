import {EditorInstance} from "../editorClient.ts";
import {EditorCommand} from "@osucad/common";

export function bookmarkInteractions({ beatmapManager, commandManager, clock }: EditorInstance) {
  const bookmarks = beatmapManager.beatmap.bookmarks;

  useEventListener("keydown", (e) => {
    if (e.code === "KeyB" && e.ctrlKey) {
      e.preventDefault();
      if (e.shiftKey) {
        const bookmark = bookmarks.find((it) => Math.abs(it.time - clock.currentTime) < 100);
        if (!bookmark) return;
        commandManager.submit(EditorCommand.removeBookmark({
          time: bookmark.time,
        }));
      } else {
        commandManager.submit(EditorCommand.createBookmark({
          time: clock.currentTime,
          name: "",
        }));
      }
    }
  });
}