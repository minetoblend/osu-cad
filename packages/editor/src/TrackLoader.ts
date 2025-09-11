import type { AudioManager, Track } from "@osucad/framework";
import { EditorFileReference } from "./EditorFileReference";
import type { EditorBeatmap } from "./runtime";

export class EditorAudioTrack extends EditorFileReference<Track>
{
  public constructor(
    editorBeatmap: EditorBeatmap,
    audioManager: AudioManager,
  )
  {
    super(
        editorBeatmap.fileSystem,
        editorBeatmap.beatmapInfo.audioFileBindable,
        async (data) => audioManager.context
          .decodeAudioData(data)
          .then(buffer => audioManager.createTrack(buffer)),
    );
  }
}
