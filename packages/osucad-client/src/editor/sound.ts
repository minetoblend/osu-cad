import axios from "axios";
import { IUnisonContainer } from "@osucad/unison-client";
import { Sound } from "@pixi/sound";
import { log } from "mathjs";

export async function loadAudio(container: IUnisonContainer) {
  const { data: audioUrl } = await axios.get(
    `https://api.osucad.com/editor/${container.id}/audio`,
    {
      withCredentials: true,
    }
  );

  const response = await axios.get(audioUrl, {
    responseType: "arraybuffer",
  });

  return await new Promise<{ songAudio: Sound }>((resolve, reject) => {
    const sound = Sound.from({
      preload: true,
      source: response.data,
      loaded: (err) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            songAudio: sound,
          });
        }
      },
    });
  });
}
