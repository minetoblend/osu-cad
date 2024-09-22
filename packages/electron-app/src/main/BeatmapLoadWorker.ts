import { readFile } from 'node:fs/promises';
import OsuDBParser from 'osu-db-parser';
import { parentPort, workerData } from 'worker_threads'

const port = parentPort
if (!port) throw new Error('IllegalState')

port.on('message', async message => {
  try {
    console.log('Loading beatmaps from ', message)

    const buffer = await readFile(message.dbPath);
    const osuDB = new OsuDBParser(buffer);

    const data = osuDB.getOsuDBData();

    const beatmaps = data.beatmaps.filter(it => it.mode === 0)
      .map(beatmap => {
        const {
          md5,
          folder_name,
          osu_file_name,
          audio_file_name,
          mode,
          artist_name,
          song_title,
          star_rating_standard,
          creator_name,
          preview_offset,
          difficulty,
        } = beatmap

        return {
          md5,
          folder_name,
          osu_file_name,
          audio_file_name,
          mode,
          artist_name,
          song_title,
          difficulty,
          star_rating_standard: [star_rating_standard[0]],
          creator_name,
          preview_offset,
        }
      });


    port.postMessage(beatmaps);
  } catch (e) {
    console.error('Failed to load beatmaps', e);

    port.postMessage(null);
  }
})

