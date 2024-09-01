import { BeatmapDecoder } from 'osu-parsers';
import type { ParsedBeatmapInfo } from './ParsedBeatmapInfo';

globalThis.onmessage = async (event) => {
  const { id, contents } = event.data;

  try {
    const beatmap = new BeatmapDecoder().decodeFromString(contents, {
      parseEvents: true,
    });

    postMessage({
      id,
      beatmap: {
        backgroundPath: beatmap.events.backgroundPath,
      } as ParsedBeatmapInfo,
    });
  }
  catch (error) {
    postMessage({ id, error });
  }
};
